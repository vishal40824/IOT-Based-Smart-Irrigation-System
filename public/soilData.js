var socket = io.connect("http://192.168.43.233:3300");
var output1 = document.getElementById("soilInp");
var output2 = document.getElementById("dayInp");
var pumpBtn = document.getElementById("pumpBtn");
var manualBtn = document.getElementById("manualBtn");
var pumpDisp = document.getElementById("pumpDisp");
var pumpStart;

pumpBtn.disabled = true;

// Listen for events from the server
socket.on('soilValue', function (data) {
   
   output1.innerHTML = "<br><p>No. of client(s) connected: " + data.clientNo + "</p><p>The Current moisture level is: <strong>" + data.soilData + "%</strong></p>"
   
   if(data.dayData === "sunny"){
      output2.innerHTML = "<p>It is currently <strong>day time</strong></p><p>and it is <span style='color:#FF6F00;'><strong>" + data.dayData + "</strong></span> at the fields</p>";
   }
   else if(data.dayData === "cloudy"){
      output2.innerHTML = "<p>It is currently <strong>day time</strong></p><p>and it is <span style='color:#616161;'><strong>" + data.dayData + "</strong></span> at the fields</p>";
   }
   else{
      output2.innerHTML = "<p>It is currently <strong>" + data.dayData + "</strong> time at the fields</p>";
   }
});

// Listen to the enable/disbale button  
manualBtn.addEventListener('click',function(){
   if(pumpBtn.disabled){
      pumpBtn.disabled = false;
      socket.emit('manual',true);
      pumpDisp.innerHTML = "<br><p class='alert alert-warning'>The Sytem is under manual control</p>"
   }
   else{
      pumpBtn.disabled = true;
      socket.emit('manual',false);
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
   }
   else{
      pumpStart = false;
      pumpBtn.className = "btn btn-success";
      pumpBtn.value = "ON";
   }
});

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
