>## How to setup the project using Johnny-Five, Socket.io, ThingSpeak and MongoDB

This Repository is about how to set up an Irrigation system that automates the entire workflow

Realtime sensor data will be displayed on the client side using Socket.io 

All the details on how to setup the sensors is given in the /bin/www file

> commands to run before you start

* Go to root directory of the project
* Open the Terminal and type the below commands

```
npm i
```

>Components needed

| Name | Quantity |	Component |
| --- | :---: | --- |
R1 | 1 | Photoresistor
U1 | 1 | Arduino Uno R3
R2 | 1 | 150 kΩ Resistor
Drelay | 1 | Red LED
RledResistor | 1|100 Ω Resistor
soil Moisture Sensor|1| sensor
Submersible Pump|1| Relay SPDT

> Circuit Connections

![Screenshot](connections.png)
