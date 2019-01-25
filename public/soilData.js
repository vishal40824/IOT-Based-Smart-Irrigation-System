var socket = io.connect("http://192.168.43.122:3300");
var output = document.getElementById("soilInp");

// Listen for events
socket.on('soilValue', function (data) {
   console.log(data);
   output.innerHTML = "<p>Your client No. is: " + data.clientNo + "</p><p>The Current moisture level is: <strong>" + data.soilData + "%</strong></p>"
});