var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/irrigation', { useCreateIndex: true, useNewUrlParser: true });
var db = mongoose.connection;

var recordSchema = mongoose.Schema({
    whichUser: {
        type: String
    },
    soil: {
        type: String
    },
    light: {
        type: String
    },
    temp: {
        type: String
    },
    wind: {
        type: String
    },
    humidity: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

var Record = module.exports = mongoose.model('recordedsensor', recordSchema);