var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var bcrypt = require('bcryptjs');
var Attrib = require('../models/fieldAttribHistory');
var globalUser;
var userSess;

var localStrategy = require('passport-local').Strategy;
var User = require('../models/user');

// Caching disabled for every route
router.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.get('/forgot', function(req, res){
  // console.log(userSess);
  res.render('forgot',{title: 'Forgot Password'});
});

router.get('/reset', function(req, res){
  userSess = req.session;

  // Check whether the session is set for a user
  if(userSess.username){
    res.render('reset', {title:'Reset Password'});
    globalUser = req.query.user;
    console.log(globalUser);
  }
  else{
    req.flash('error', 'Session timeout, please try again');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
 passport.authenticate('local', {failureRedirect: "/users/login", failureFlash: 'Invalid Username or Password'}),
  function(req, res){
    module.exports.userName = req.body.username;
    if(req.body.rememberMe){
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 6; // 4 days
    }
    else{
      req.session.cookie.expires = false;
    }
    res.redirect('/');
});

passport.use(new localStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unkown User'});
      }

      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) return done(err);
        if(isMatch){
          return done(null, user);
        }else{
          return done(null, false, {message:'Invalid Password'});
        }
      });
    });
}));


router.post('/register', upload.single('profileImage'),function(req, res, next) {
    var userField= req.body.user;
    var email= req.body.email;
    var password= req.body.password;
    var password2= req.body.password2;
    var plant = req.body.plant;
    var soil = req.body.soil;
    var height = req.body.height;
    var city = req.body.city;

    User.find({username: userField}, function(err, doc){
      if(doc.length > 0){
        res.render('register',{
          errors: [{'msg':'Username already exists'}]
        });
      }else{
        if(req.file){
          console.log('uploading file...');
          var profileImg = req.file.filename;
        }else{
          console.log('No file upload...');
          var profileImg = 'noImage.jpg';
        }
        
        // Form validation
        req.checkBody('user', 'Name field is required').notEmpty();
        req.checkBody('email', 'Email field is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('password', 'Password field is required').notEmpty();
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
        req.checkBody('plant', 'Plant name field is required').notEmpty();
        req.checkBody('height', 'Height of plant field is required').notEmpty();
        req.checkBody('soil', 'Soil name field is required').notEmpty();
        req.checkBody('city', 'City field is required').notEmpty();
        
        // Check for Errors
        var errs = req.validationErrors();
        
        if(errs){
          res.render('register',{
            errors: errs
          });
        } 
        else{
          var newUser = new User({
            username: userField,
            email: email,
            password: password,
            profileImage: profileImg,
            typeOfPlant: plant,
            typeOfSoil: soil,
            height: height,
            city:city
          });

          var newAttrib = {
            whichUser: userField,
            typeOfPlant: plant,
            typeOfSoil: soil,
            height: height
          }

          Attrib.create(newAttrib, function(err, attrib){
            if(err) throw err;
            else{
              User.createUser(newUser, function(err, user){
                if(err) throw err;
                else{
                  req.flash('success', 'You are now registered and can login');
                  res.location('/');
                  res.redirect('/');
                }
              });
            }
          });
        } // Inner Else ends 
      } // Outer Else ends
    });

});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'Successfully logged out');
  res.redirect('/');
});

router.post('/forgot', function (req, res) {
  /* 
    Assigning a session variable so that the user cannot 
    access the /reset page every Time. 
  */
  userSess = req.session;
  var userField = req.body.username;
  userSess.username = userField;

  User.find({username:userField}, function(err, doc){
    if(doc.length > 0){
      var mess = '<b>' + userField + '</b> Please check your inbox to change your password';
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'vishalvshl3@gmail.com',
          pass: 'vishal98801991661'
        }
      });

      console.log(doc[0].email);
      
      var mailOptions = {
        from: 'vishalvshl3@gmail.com',
        to: doc[0].email,
        subject: 'Request for Password Reset',
        html:`Please <a href='${req.protocol}://${req.get('host')}/users/reset?user=${doc[0].username}'>Click Here</a> to change your password.
        <p>You will have only <b>10 minutes</b> to change your password before the session expires.</p>`,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } 
        else {
          // Show that an email has been sent
          req.flash('success', mess);
          res.redirect('/');
          console.log(`Email sent. Time took to send the mail: ${info.messageTime/1000} Seconds`);
        }
      });
    }
    else{
      // Check for an authentic user
      req.flash('error', 'Please provide a valid username');
      res.redirect('/users/forgot');
    }
  });
});

router.post('/reset', function(req, res){
  req.checkBody('pass1', 'Password field is required').notEmpty();
  req.checkBody('pass2', 'Passwords do not match').equals(req.body.pass1);

  // Check for Errors
  var errs = req.validationErrors();
        
  if(errs){
    res.render('reset',{
      errors: errs
    });
  } 
  else{

    // Update the user password
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.pass1, salt, function(err, hash) {
        var passChange = hash;
        User.findOneAndUpdate({username: globalUser}, {password: passChange},
          function(err, user){
            if(err) throw err;
            else{
              req.flash('success', 'Your password has been reset');
              res.redirect('/');

              // Destroy the /reset password session
              setTimeout(function(){
                req.session.destroy();
              },100);
            }
        });
      });
    });
    
  }
});

module.exports = router;