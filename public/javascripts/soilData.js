var socket = io.connect("http://192.168.43.233:3000");
var soilInp = document.getElementById("soilInp");
var lightInp = document.getElementById("lightInp");
var dayInp = document.getElementById("dayInp");
var pumpBtn = document.getElementById("pumpBtn");
var manualBtn = document.getElementById("manualBtn");
var pumpDisp = document.getElementById("pumpDisp");
var weatherData = document.getElementById("weatherDetails");
var mic = document.getElementById("mic");
var micDisp = document.getElementById("micDisp");
var currentPumpState = document.getElementById("currentPumpState");

var pumpStart;
var soilValCheck;
var lightValCheck;
var micStart = true;

pumpBtn.disabled = true;

function tConvert (time) {
   // Check correct time format and split into components
   time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
 
   if (time.length > 1) { // If time format correct
     time = time.slice (1);  // Remove full string match value
     time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
     time[0] = +time[0] % 12 || 12; // Adjust hours
   }
   return time.join (''); // return adjusted time or original string
 }

// Listen for events from the server
socket.on('soilValue', function (data) {   
   if(soilValCheck < data.soilData){
      soilInp.innerHTML = `
      <p>Client(s) connected: ${data.clientNo}</p>
      <p>Current moisture level: <strong>${data.soilData}% </strong><span class='fas fa-angle-double-up text-success'></span></p>`;
   }
   else{
      soilInp.innerHTML = `
      <p>Client(s) connected: ${data.clientNo}</p>
      <p>Current moisture level: <strong>${data.soilData}% </strong><span class='fas fa-angle-double-down text-danger'></span></p>`;
   }

   if(lightValCheck < data.light){
      lightInp.innerHTML = `
      <p>Current light intensity: <strong>${data.light}% </strong><span class='fas fa-angle-double-up text-success'></span></p>`;
   }
   else{
      lightInp.innerHTML = `
      <p>Current light intensity: <strong>${data.light}% </strong><span class='fas fa-angle-double-down text-danger'></span></p>`;
   }

   if(data.dayData === "sunny"){
      dayInp.innerHTML = `
      <p>It is currently <strong>day time</strong></p>
      <p>and it is <span style='color:#FF6F00;'><strong>${data.dayData}</strong></span> at the fields</p>`;
   }
   else if(data.dayData === "cloudy"){
      dayInp.innerHTML = `
      <p>It is currently <strong>day time</strong></p>
      <p>and it is <span style='color:#616161;'><strong>${data.dayData}</strong></span> at the fields</p>`;
   }
   else{
      dayInp.innerHTML = `<p>It is currently <strong>${data.dayData}</strong> time at the fields</p>`;
   }
   soilValCheck = data.soilData;
   lightValCheck = data.light;
});

// Listen to the enable/disbale button  
manualBtn.addEventListener('click',function(){
   if(pumpBtn.disabled){
      pumpBtn.disabled = false;
      socket.emit('manual',true);
      manualBtn.value = "Disable";
      manualBtn.className = `btn btn-info`;
      pumpDisp.innerHTML = `<br><p class='alert alert-warning'>The Sytem is under manual control</p>`;
   }
   else{
      pumpBtn.disabled = true;
      socket.emit('manual',false);
      manualBtn.value = "Enable";
      manualBtn.className = `btn btn-primary`;
      pumpDisp.innerHTML = "";
   }
});

// Listen to the Pump Switch button
pumpBtn.addEventListener('click', function(){
   socket.emit('pumpOper', pumpStart);
});

// Listen for the current state of the pump and change the button values
socket.on('currentPumpState', function(data){
   if(data){
      pumpStart = true;
      pumpBtn.className = "btn btn-danger";
      pumpBtn.value = "OFF";
      currentPumpState.innerHTML = `Note: Pump is Currently <b class='badge badge-success'>ON</b>`;
   }
   else{
      pumpStart = false;
      pumpBtn.className = "btn btn-success";
      pumpBtn.value = "ON";
      currentPumpState.innerHTML = `Note: Pump is Currently <b class='badge badge-secondary'>OFF</b>`;
   }
});

// Listen to this event to check whether the pump is broken or not 
socket.on('PumpBroke_ManualOn', function(data){
   pumpBtn.disabled = false;
   socket.emit('manual',data);
   pumpDisp.innerHTML = `
   <br>
   <div class="card">
      <div class="card-header bg-warning text-dark">
         <p>The Sytem is under manual control!!</p>
      </div>
      <div class="card-body bg-light text-justify">
         <p class='alert alert-danger'>Because the soil moisture sensor might have been broken or damaged for some other reasons.</p>
      </div>
   </div>
   `;
});

// Getting the weather data from the server
socket.on('weatherData', function(data){
   var tempCheck = data.tempr;
   if(tempCheck < 32){
      var tempStr = `<p>Temperature: <strong>${data.tempr} </strong><span class="text text-info"><i class="fas fa-temperature-low text text-info"></i>C</span></p>`;
   }
   if(tempCheck > 32){
      var tempStr = `<p>Temperature: <strong>${data.tempr} </strong><span class="text text-danger"><i class="fas fa-temperature-low"></i>C</span></p>`;
   }

   weatherData.innerHTML = `
   <p>(Last updated at: <strong>${tConvert(data.update_time)}</strong>
   <img src="${data.imageUrl}" width="30px" height="25px">)
   </p>
   <p>Your area is <strong>${data.city} </strong><i class="fas fa-home"></i><p>
   ${tempStr}
   <p>Wind Speeds: <strong>${data.wind} </strong><i class="fas fa-wind text text-info"></i></p>
   <p>Humidity: <strong>${data.humidity} g/m<sup>3</sup> </strong><i class="fas fa-humidity"></i></p>`;
});

// Listen to the mic icon click event
mic.addEventListener('click', function () {
   if(micStart){
      micStart = false;
      socket.emit('micListen',true);
      micDisp.innerHTML = "Mic enabled";
      mic.className = "fas fa-microphone-slash";
   }
   else{
      micStart = true;
      socket.emit('micListen',false);
      micDisp.innerHTML = "Turn on to give voice commands";
      mic.className = "fas fa-microphone";
   }
});
