An ESP32 Environmental Monitoring with Neo-7M GPS and DHT22 Sensor
Overview
This repository contains the code and resources for a real-time environmental monitoring system built with an ESP32 microcontroller, Neo-7M GPS module, and DHT22 sensor. The system provides precise location tracking along with temperature and humidity monitoring, displaying the data on a website.

Features
Real-Time Monitoring: Continuously collects data from the GPS module and DHT22 sensor.
Location Tracking: Utilizes the Neo-7M GPS module to determine the device's precise location.
Temperature and Humidity Monitoring: Measures environmental conditions using the DHT22 sensor.
Data Display: Presents the collected data (location, temperature, humidity) on a website for easy access and visualization.
Alerting: Provides alerts if the temperature exceeds predefined thresholds.
Getting Started

Hardware Requirements

ESP32 development board
Neo-7M GPS module
DHT22 sensor
Jumper wires
Breadboard (optional)
Software Requirements
Arduino IDE

Libraries: Blynk, TinyGPS++, DHT sensor library

Setup Instructions

Connect the ESP32, Neo-7M GPS module, and DHT22 sensor as per the provided schematic or wiring instructions.
Install the necessary libraries in your Arduino IDE.
Clone this repository to your local machine or download the ZIP file.
Open the Arduino sketch (ESP32_Environmental_Monitoring.ino) in the Arduino IDE.
Configure the sketch with your Wi-Fi credentials, Blynk authentication token, and ThingSpeak API key.
Upload the sketch to your ESP32 board.
Access the provided web interface to monitor the data in real-time.
Usage
Power on the ESP32 board and ensure it's connected to the internet.
Access the web interface (URL provided in the serial monitor or documentation).
Monitor the temperature, humidity, and location data displayed on the website.
Receive alerts if the temperature exceeds predefined thresholds.

Contributors
AdeepaK2

License
This project is licensed under the MIT License.

Support
For any issues or inquiries, please contact kularathnaggas>22@uom.lk.
