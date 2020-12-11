var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/irrigation', { useCreateIndex: true, useNewUrlParser: true });
var db = mongoose.connection;

var attribSchema = mongoose.Schema({
    whichUser: {
        type: String
    },
    typeOfPlant: {
        type:String
    },
    typeOfSoil: {
        type: String
    },
    height: {
        type: Number
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});


var Attrib = module.exports = mongoose.model('fieldattrib', attribSchema);