var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var Attrib = require('../models/fieldAttribHistory');
var Record = require('../models/recordSensorData');

var ensureAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/users/login');
  }
}

/* GET home page. */
router.get('/', ensureAuthenticated,function(req, res, next) {
  res.sendFile('templates/index.html', {root: __dirname});
});

// All the console routing begins from here
router.get('/api/fieldData', function(req, res){
  var currentLoggedUser = require('./users').userName;
  User.find({"username": currentLoggedUser}, function(err, data){
      if(err) res.send(err);
      else res.json(data);
  });
});

router.get('/api/fieldData/:id', function(req, res){
  User.findOne({_id: req.params.id}, function(err, data){
      if(err) res.send(err);
      else res.json(data);
  });
});

router.put('/api/fieldData/:id', function(req, res){
  var newAttrib = {
    whichUser: req.body.username,
    typeOfPlant: req.body.typeOfPlant,
    typeOfSoil: req.body.typeOfSoil,
    height: req.body.height
  }
  Attrib.create(newAttrib, function(err, data){
    if(err) res.send(err);
    else{
      User.findOneAndUpdate({_id: req.params.id}, req.body, function(err, data){
          if(err) res.send(err);
          else res.json(data);
      });
    }
  });
});

router.get('/api/attribData', function(req, res){
  var currentLoggedUser = require('./users').userName
  Attrib.find({"whichUser": currentLoggedUser}, function(err, data){
    if(err) res.send(err);
      else res.json(data);
  });
});

router.get('/api/recordData', function(req, res){
  Record.find({"whichUser": require('./users').userName}, function(err, data){
    if(err) res.send(err);
    else res.json(data);
  });
});

router.get('/api/getUserData', function(req, res){
  User.findOne({"username": require('./users').userName}, function(err, data){
    if(err) res.send(err);
    else res.json(data);
  });
});

router.put('/api/updateEmail/:id', function(req, res){
  User.findOneAndUpdate({_id: req.params.id}, {"email": req.body.email}, function(err, data){
    if(err) res.send(err);
    else{
      res.json({"mess": "Your email was updated successfully"})
    }
  });
});

router.put('/api/updateCity/:id', function(req, res){
  User.findOneAndUpdate({_id: req.params.id}, {"city": req.body.city}, function(err, data){
    if(err) res.send(err);
    else{
      res.json({"mess": "Your city was updated successfully"})
    }
  });
});

router.put('/api/updatePass/:id', function(req, res){
  var pass1 = req.body.pass1;
  var pass2 = req.body.pass2;
  if(pass1 !== pass2){
    res.json({"mess": "Passwords do not match"});
  } 
  else{
    // Update the user password
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.pass1, salt, function(err, hash) {
        var passChange = hash;
        User.findOneAndUpdate({_id: req.params.id}, {password: passChange},
          function(err, user){
            if(err) throw err;
            else{
              res.json({"mess": "Password Updated successfully"})
            }
        });
      });
    });
  }
});

// Get the currently logged in users
router.get('/api/getWhichUser', function(req, res){
  User.findById({_id: req.session.passport.user }, function(err, data){
    if(err) res.send(err);
    else res.json({"loggedUser": data.username});
  });
});

// router.delete('/api/fieldData/:id', function(req, res){
//   User.findOneAndDelete({_id:req.params.id}, function(err, data){
//       if(err) res.send(err);
//       else res.json(data);
//   });
// });

module.exports = router;