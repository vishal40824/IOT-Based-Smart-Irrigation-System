var weather = require('weather-js');
var User = require('../routes/users');
var detail_array;

weather.find({search:'bengaluru', degreeType: 'C'}, function(err, res){
    if (err) return console.log(err);
    
    `Use this to save the details to a File.json`
    // detail_array = JSON.stringify(res, null, 2);
    // console.log(detail_array);

    res.forEach(element => {
        detail_array = element;
    });

    module.exports.all = detail_array;
    module.exports.humidity = detail_array.current.humidity;
    module.exports.url = detail_array.current.imageUrl;
    module.exports.city = detail_array.location.name;
    module.exports.tempr = detail_array.current.temperature;
    module.exports.wind = detail_array.current.winddisplay;
});