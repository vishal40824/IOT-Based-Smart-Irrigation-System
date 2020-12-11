# How to setup the project

### Note: Make sure you have made the neccessary connections to the arduino and the sensors before you start with this project

> Circuit Diagram

![Screenshot](connections.png)

This Repository is about an Irrigation system that automates the entire workflow

Realtime sensor data will be displayed on the client side using Socket.io 

All the details on how to setup the sensors is given in the "/bin/www" file


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

> commands to run before you start

* Go to root directory of the project (i.e., IOT-Based-Smart-Irrigation-System/)
* Open the Terminal and type the below command(s)

```
npm i
```

* The above command will install certain dependencies, which might take some time depending on your internet
* To start the server use the following command

```
npm start
```