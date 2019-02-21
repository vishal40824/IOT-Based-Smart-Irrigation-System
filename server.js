var express = require('express');
var events = require('events');
var ip = require('ip');
var app = express();
var five = require('johnny-five');
var ThingSpeak = require('thingspeakclient');
var board, soilSensor, soilValue, led, ldr, ldrVal, temp;
var currTime, isDay, sunny, relay, dayLight, manual, current_pump_state;

const port = process.env.PORT || 3300;
const led_pin = 10;
const relay_pin = 11;
const soil_sensor_pin = "A0";
const ldr_pin = "A2";

var eventEmitter = new events.EventEmitter();
var client = new ThingSpeak();
var noClients = 0;
var startFlag = true;

var channelID = 687385;
var writeKey = 'ZR8A9S3ALIDSIMRN';

app.use(express.static(__dirname + "/public"));

board = new five.Board();

// Connect to your ThingSpeak account using the ThingSpeakClient
client.attachChannel(channelID, {writeKey: writeKey}, function (err){
    if (!err) {
        console.log(`Successfully connected to ThingSpeak`);
    }
    else {
        console.log(`Cannot connect to ThingSpeak!!`);
    }
});


// Check whether the board is ready to accept the requests
board.on("ready", function () { 
    
    // Read the Soil Moisture Sensor [SMS] data
    soilSensor = new five.Sensor({
        pin: soil_sensor_pin,
        freq: 500,
    });
    // Read the photo resistor data
    ldr = new five.Sensor({
        pin: ldr_pin,
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
            if(Number(currTime >= 5.00) && Number(currTime) < 11.00){
                // console.log("It is early morning");
                isDay = false;
                sunny = true;
            }
            else{
                // console.log("It is night time");
                isDay = false;
            }
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
    
    // This async event is used to check whether the SMS is working properly or not
    soilSensor.on("change", function() {
        temp++;
        checkVal = this.fscaleTo(100, 0).toFixed(2);
    });
    
    // Function to delay the water supply to the plants i.e., 3 Seconds
    var relayOff = function(){
        led.fadeOut();
        relay.off();
        startFlag = true;
    }
    
    // Function to check whether the SMS is working properly or not
    var checkSMS = function(){
        temp = 0;
        var checkVal;
        
        setTimeout(function(){
            if(temp === 0 || checkVal === soilValue){
                console.log(`The soil moisture sensor seems to be not working properly,\nSince it has given the data ${temp} times`);
                eventEmitter.emit("PumpBroke_ManualOn");
            }
        }, 1000);
    }
    
    // Checks whether the SMS is working properly or not for every 10 mins
    setInterval(checkSMS, 6000);
    
    //Perform an action when ever the SMS changes its values
    soilSensor.on("data", function (val) {
        //Converting the SMS values in 0% - 100% value
        soilValue = this.fscaleTo(100, 0).toFixed(2);
        
        //Emitting an event to update the soil values
        eventEmitter.emit('soilEvent');
        
        if(!manual){
            //If the Moisture level goes below 32% at night then turn the LED and RELAY ON
            if((soilValue <= 32) && (!isDay)){
                led.fadeIn();
                relay.on();
                current_pump_state = true;
                eventEmitter.emit('pumpState');
            }
            //If the Moisture level goes above 74% at night then turn the LED and RELAY OFF
            if(soilValue > 68 && (!isDay) && startFlag){
                setTimeout(relayOff, 3000); // Delaying 3 seconds to turn OFF the Pump
                startFlag = false;
                current_pump_state = false;
                eventEmitter.emit('pumpState');
            }
            if(soilValue > 32 && soilValue < 74){
                current_pump_state = false;
                eventEmitter.emit('pumpState');    
            }
            //If the Moisture level goes below 22% at day then turn the LED and RELAY ON
            if((soilValue <= 22) && (isDay)){
                led.fadeIn();
                relay.on();
                current_pump_state = true;
                eventEmitter.emit('pumpState');
            }
            //If the Moisture level goes above 74% at day then turn the LED and RELAY OFF
            if(soilValue > 68 && (isDay) && startFlag){
                setTimeout(relayOff, 2000); // Delaying 2 seconds to turn OFF the Pump
                startFlag = false;
                current_pump_state = false;
                eventEmitter.emit('pumpState');
            }
        }
        // console.log("The moisture level is: " + soilValue + "%");
    });
    
    // This Callback is the server program ends
    this.on('exit', function(){
        led.off();
        relay.off();
        console.log("Board is closing!");
    });
});

// Initialising the server for listening to a port
var server = app.listen(port,function () {
    console.log("connected to http://%s:%s", ip.address(), server.address().port);
});

var io = require('socket.io')(server);

// Checking a connection from a client
io.on('connection', function (socket) {
    noClients++;
    
    socket.on('disconnect', function () {
        //Check for disconnected Users/Clients
        console.log("Client: " + socket.id + " has disconnected")
        noClients--;
    });
    
    eventEmitter.on('soilEvent',function(){
        if(isDay && sunny){
            dayLight = "sunny";
        }
        if(isDay && !sunny){
            dayLight = "cloudy";
        }
        if(!isDay){
            dayLight = "night";
        }
        if(!isDay && sunny){
            dayLight = "early morning";
        }
        // Emitting the data to all the clients
        socket.emit('soilValue',{soilData: soilValue, clientNo: noClients, dayData: dayLight});
    });

    // Check for the 'pumpOper' event emitted by the client
    socket.on('pumpOper', function(data){
        if(data){
            led.toggle();
            relay.toggle();
            current_pump_state = false;
            eventEmitter.emit('pumpState');
        }
        else{
            led.toggle();
            relay.toggle();
            current_pump_state = true;
            eventEmitter.emit('pumpState');
        }
    });

    socket.on('manual', function(data){
        manual = data;
    });
    
    eventEmitter.on('pumpState', function(){
        socket.emit('currentPumpState', current_pump_state);
    });

    eventEmitter.on('PumpBroke_ManualOn', function(){
        socket.emit('PumpBroke_ManualOn', true);
    });
});
