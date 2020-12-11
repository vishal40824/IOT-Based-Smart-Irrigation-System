var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/irrigation',{ useCreateIndex: true, useNewUrlParser: true });

var db = mongoose.connection;

var userSchema = mongoose.Schema({
    username:{
        type:String,
        index: true
    },
    password:{
        type:String
    },
    email:{
        type:String
    },
    profileImage:{
        type:String
    },
    city:{
        type: String
    },
    typeOfPlant:{
        type:String
    },
    typeOfSoil:{
        type: String
    },
    height:{
        type: Number
    }
});

var User = module.exports = mongoose.model('User', userSchema);

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        callback(null, isMatch);
    });
}

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}