#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <BlynkSimpleEsp32.h>
#include <Wire.h>
#include <TinyGPS++.h>

#define WIFI_SSID "Your_WiFi_SSID" // Change to your WiFi SSID
#define WIFI_PASSWORD "Your_WiFi_Password" // Change to your WiFi password

#define DHTPIN 26     // Pin connected to the DHT sensor
#define DHTTYPE DHT22   // DHT 22 (AM2302)

#define EVENT_HIGH_TEMPERATURE "high_temperature"

DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial neogps(1);

void setup() {
    Serial.begin(9600);
    Serial.println("DHT22 Temperature and Humidity Reading");
    dht.begin();
    neogps.begin(9600, SERIAL_8N1, 16, 17); // Assuming RXD2 is pin 16 and TXD2 is pin 17
    connectToWiFi();
}

void loop() {
    temperatureAll();
    gpsAll();
}

void temperatureAll() {
    float temperature, humidity;
    readDHTSensor(temperature, humidity);
    sendDataToThingSpeak(gps.location.lat(), gps.location.lng(), temperature, humidity);
    delay(10000); // Adjust delay as needed
}

void gpsAll() {
    boolean newData = false;
    for (unsigned long start = millis(); millis() - start < 1000;) {
        while (neogps.available()) {
            if (gps.encode(neogps.read())) {
                newData = true;
            }
        }
    }
    if (newData) {
        newData = false;
        if (gps.location.isValid()) {
            Serial.print("Latitude: ");
            Serial.println(gps.location.lat(), 6);
            Serial.print("Longitude: ");
            Serial.println(gps.location.lng(), 6);
        } else {
            Serial.println("Location not available");
        }
    } else {
        Serial.println("No new data");
    }
    delay(20000);
}

void connectToWiFi() {
    Serial.println("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting...");
    }
    Serial.println("Connected to WiFi");
}

void readDHTSensor(float &temperature, float &humidity) {
    temperature = dht.readTemperature(); // Read temperature in Celsius
    humidity = dht.readHumidity(); // Read humidity
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor!");
        return;
    }
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
}

void sendDataToThingSpeak(float latitude, float longitude, float temperature, float humidity) {
    HTTPClient http;
    String server = "api.thingspeak.com";
    String apiKey = "Your_API_Key"; // Insert your ThingSpeak API Key
    String url = "https://" + server + "/update?api_key=" + apiKey + "&field1=" + String(latitude, 6) + "&field2=" + String(longitude, 6) + "&field3=" + String(temperature) + "&field4=" + String(humidity);
    Serial.print("Sending data to ThingSpeak: ");
    Serial.println(url);
    http.begin(url);
    int httpResponseCode = http.GET();
    if (httpResponseCode == 200) {
        Serial.println("Data sent successfully to ThingSpeak");
    } else {
        Serial.print("Error sending data to ThingSpeak. HTTP error code: ");
        Serial.println(httpResponseCode);
    }
    http.end();
}
