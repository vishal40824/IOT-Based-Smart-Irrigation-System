var express = require('express');
var ip = require('ip');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var five = require('johnny-five'), board, soil, soilValue, led;
var Things = require('thingspeakclient');
var client = new Things();
var noClients = 0;

var flag = 0;
//ThingSpeak Info
var channelID = 'Your Channel ID';
var writeKey = 'Your Write Key';

app.use(express.static(__dirname + "/public"));

board = new five.Board();

//Connect to your ThingSpeak account using the ThingSpeakClient
client.attachChannel(channelID, {writeKey: writeKey}, function (err){
    if (!err) {
        console.log('Successfully connected to ThingSpeak!');
    }
    else {
        console.log("Cannot connect to ThingSpeak");
    }
});

board.on("ready", function () {
    io.on('connection', function (socket) {
        // console.log("Made a Socket Connection: " + socket.id);
        socket.on('disconnect', function () {
            //Check for disconnected users/clients
            console.log("Client: " + noClients + " has disconnected")
            noClients--;
        });

        //Read the Soil Moisture Sensor [SMS] data
        soil = new five.Sensor({
            pin: "A0",
            freq: 500,
        });
        noClients++;

        //Perform an action when ever the SMS changes its values
        soil.on("change", function () {
            //converting the SMS values in 0-100% value
            soilValue = this.fscaleTo(100, 0).toFixed(2);

            //Emitting the data to all the clients
            socket.emit('soilValue',{soilData: soilValue, clientNo: noClients});

            //Updating the ThingSpeak Channel Data
            client.updateChannel(channelID, {field1: soilValue}, function(err, resp) {
                if (!err && resp > 0) {
                    console.log('updated successfully. Entry was: ' + resp + ". Data was: " + soilValue);
                }
                else {
                    console.log("Cannot update to ThingSpeak");
                }
            });

            //If the Moisture level goes above 40% then turn the LED ON
            if(soilValue > 40 && flag === 0){
                led = new five.Led(9);
                led.fadeIn();
                flag = 1;
            }
            //Else OFF
            if(soilValue <= 40 && flag === 1){
                led.fadeOut();
                flag = 0;
            }

            console.log("The moisture level is: " + soilValue + "%");
        });
    });
});


var server = http.listen(3300,function () {
    console.log("connected to http://%s:%s", ip.address(), server.address().port);
});
