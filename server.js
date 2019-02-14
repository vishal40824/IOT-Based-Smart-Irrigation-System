var express = require('express');
var events = require('events');
var ip = require('ip');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var five = require('johnny-five');
var ThingSpeak = require('thingspeakclient');
var board, soilSensor, soilValue, led, ldr, ldrVal;
var currTime, isDay, sunny, relay;

const port = process.env.PORT || 3300;
const led_pin = 10;
const relay_pin = 11;

var eventEmitter = new events.EventEmitter();
var client = new ThingSpeak();
var noClients = 0;

var flag = 0;
var channelID = 687385;
var writeKey = 'ZR8A9S3ALIDSIMRN';

app.use(express.static(__dirname + "/public"));

board = new five.Board();

// Connect to your ThingSpeak account using the ThingSpeakClient
client.attachChannel(channelID, {writeKey: writeKey}, function (err){
    if (!err) {
        console.log('Successfully connected to ThingSpeak!');
    }
    else {
        console.log("Cannot connect to ThingSpeak");
    }
});

// Check whether the board is ready to accept the requests
board.on("ready", function () { 
    
    // Read the Soil Moisture Sensor [SMS] data
    soilSensor = new five.Sensor({
        pin: "A0",
        freq: 500,
    });
    // Read the photo resistor data
    ldr = new five.Sensor({
        pin:'A2',
        freq:500
    });
    led = new five.Led(led_pin);
    relay = new five.Relay(relay_pin);

    // Take the data from ldr sensor
    ldr.on('data',function(val){
        var date = new Date();
        ldrVal = this.fscaleTo(100, 0).toFixed(2);
        currTime = date.getHours() +"."+ date.getMinutes();
        // console.log("Light intensity: " + this.fscaleTo(100, 0).toFixed(2) + "%");

        /* Use this condition to check for the current time range within 11am - 4pm and sunlight intensity
         Number(currTime) >= 11.00 && Number(currTime) <= 16.00 && val < 112*/
        if(Number(currTime) >= 11.00 && Number(currTime) <= 16.00){
            isDay = true;
            if(val < 112){
                // console.log("It's sunny outside");
                sunny = true;
            }
            else{
                // console.log("It's shady outside")
                sunny = false;
            }
        }
        else{
            // console.log("It is night time");
            isDay = false;
        }

        //Updating the ThingSpeak Channel Data [default timeout is 15s]
        client.updateChannel(channelID, {field1: soilValue, field2: ldrVal}, function(err, resp) {
            if (!err && resp > 0) {
                console.log('updated successfully. Entry was: ' + resp + ". Data was: " + soilValue + ", " + ldrVal);
            }
            else {
                console.log("Cannot update to ThingSpeak");
            }
        });
    });

    //Perform an action when ever the SMS changes its values
    soilSensor.on("change", function (val) {
        //Converting the SMS values in 0% - 100% value
        soilValue = this.fscaleTo(100, 0).toFixed(2);
        
        //Emitting an event to update the soil values
        eventEmitter.emit('soilEvent');

        //If the Moisture level goes below 32% at night then turn the LED and RELAY ON
        if((soilValue <= 32) && (!isDay)){
            led.fadeIn();
            relay.on();
        }
        //If the Moisture level goes below 22% at day then turn the LED and RELAY ON
        if((soilValue <= 22) && (isDay)){
            led.fadeIn();
            relay.on();
        }

        //If the Moisture level goes above 74% at night then turn the LED and RELAY OFF
        if(soilValue > 74 && (!isDay)){
            led.fadeOut();
            relay.off();
        }
        //If the Moisture level goes above 74% at day then turn the LED and RELAY OFF
        if(soilValue > 74 && (sunny || isDay)){
            led.fadeOut();
            relay.off();
        }
        console.log("The moisture level is: " + soilValue + "%");

    });

    // Callback is the server program ends
    this.on('exit', function(){
        led.off();
        relay.off();
        console.log("Board has been disconnected");
    });
});

// Initialising the server for listening to a port
var server = http.listen(port,function () {
    console.log("connected to http://%s:%s", ip.address(), server.address().port);
});

// Checking a connection from a client
io.on('connection', function (socket) {
    noClients++;
    
    // console.log("Made a Socket Connection: " + socket.id);
    socket.on('disconnect', function () {
        //Check for disconnected Users/Clients
        console.log("Client: " + noClients + " has disconnected")
        noClients--;
    });
    
    eventEmitter.on('soilEvent',function(){
        //Emitting the data to all the clients
        socket.emit('soilValue',{soilData: soilValue, clientNo: noClients});
    });
});
