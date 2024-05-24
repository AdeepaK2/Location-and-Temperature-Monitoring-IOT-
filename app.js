let map;
let marker;
let temperatureLimit;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });

    marker = new google.maps.Marker({
        map: map
    });

    fetchTemperatureLimit();
    fetchDataAndUpdate();
    setInterval(fetchDataAndUpdate, 5000);
}

function fetchTemperatureLimit() {
    fetch('https://api.thingspeak.com/channels/2503888/feeds.json?api_key=U77JZBQJ80V6Y4G1&results=1')
        .then(response => response.json())
        .then(data => {
            const lastFeed = data.feeds[0];
            temperatureLimit = parseFloat(lastFeed.field6);
        })
        .catch(error => {
            console.error('Error fetching temperature limit:', error);
            temperatureLimit = parseFloat(prompt("Please enter your preferred temperature limit:"));
        });
}

function updateTemperatureLimit(newLimit) {
    temperatureLimit = newLimit;
    fetch(`https://api.thingspeak.com/update?api_key=UPXKBN7UMQ6BC8SW&field6=${temperatureLimit}`)
        .then(response => response.text())
        .then(data => {
            console.log('Temperature limit updated:', data);
        })
        .catch(error => {
            console.error('Error updating temperature limit:', error);
        });
}

function fetchDataAndUpdate() {
    // Fetch multiple data points from ThingSpeak
    fetch('https://api.thingspeak.com/channels/2503888/feeds.json?api_key=U77JZBQJ80V6Y4G1&results=10')
        .then(response => response.json())
        .then(data => {
            const feeds = data.feeds;
            const warningMessage = document.getElementById('warningMessage');
            const temperatureElement = document.getElementById('temperature');
            const humidityElement = document.getElementById('humidity');
            const movementElement = document.getElementById('movement');
            const lastOnlineElement = document.getElementById('lastOnline');

            let lastValidLocation = null;
            let lastValidTemperature = null;
            let lastValidHumidity = null;
            let lastValidSpeed = null;
            let lastValidTime = null;
            let allDataZero = true;
            let warnings = [];

            // Find the most recent valid data
            for (let i = feeds.length - 1; i >= 0; i--) {
                const feed = feeds[i];
                const latitude = parseFloat(feed.field1);
                const longitude = parseFloat(feed.field2);
                const temperature = parseFloat(feed.field3);
                const humidity = parseFloat(feed.field4);
                const speed = parseFloat(feed.field5);
                const created_at = new Date(feed.created_at).getTime();

                if (latitude !== 0 || longitude !== 0 || temperature !== 0 || humidity !== 0 || speed !== 0) {
                    allDataZero = false;
                }

                if ((latitude !== 0 || longitude !== 0) && !lastValidLocation) {
                    lastValidLocation = { lat: latitude, lng: longitude };
                }
                if (temperature !== 0 && !lastValidTemperature) {
                    lastValidTemperature = temperature;
                }
                if (humidity !== 0 && !lastValidHumidity) {
                    lastValidHumidity = humidity;
                }
                if (speed !== 0 && !lastValidSpeed) {
                    lastValidSpeed = speed;
                }
                if (!lastValidTime) {
                    lastValidTime = created_at;
                }
            }

            // Check the latest feed
            const latestFeed = feeds[0];
            const latestLatitude = parseFloat(latestFeed.field1);
            const latestLongitude = parseFloat(latestFeed.field2);
            const latestTemperature = parseFloat(latestFeed.field3);
            const latestHumidity = parseFloat(latestFeed.field4);
            const latestSpeed = parseFloat(latestFeed.field5);
            const latestTime = new Date(latestFeed.created_at).getTime();

            if (latestLatitude !== 0 || latestLongitude !== 0) {
                lastValidLocation = { lat: latestLatitude, lng: latestLongitude };
            }

            if (lastValidLocation) {
                marker.setPosition(lastValidLocation);
                map.setCenter(lastValidLocation);
            }

            if (latestLatitude === 0 && latestLongitude === 0 && latestTemperature !== 0 && latestHumidity !== 0) {
                warnings.push('Location fetching unsuccessful. Device might be turned off. Displaying the last seen location.');
                temperatureElement.textContent = latestTemperature.toFixed(1);
                humidityElement.textContent = latestHumidity.toFixed(1);
                movementElement.textContent = latestSpeed > 2 ? 'Device is moving' : 'Device is stationary';
                lastOnlineElement.textContent = 'Last online: ' + new Date(lastValidTime).toLocaleString();
            } else if (allDataZero) {
                warnings.push('Device is turned off. Displaying last known data.');
                temperatureElement.textContent = lastValidTemperature ? lastValidTemperature.toFixed(1) : 'N/A';
                humidityElement.textContent = lastValidHumidity ? lastValidHumidity.toFixed(1) : 'N/A';
                movementElement.textContent = lastValidSpeed > 2 ? 'Device is moving' : 'Device is stationary';
                lastOnlineElement.textContent = 'Last online: ' + new Date(lastValidTime).toLocaleString();
            } else {
                temperatureElement.textContent = latestTemperature.toFixed(1);
                humidityElement.textContent = latestHumidity.toFixed(1);
                movementElement.textContent = latestSpeed > 2 ? 'Device is moving' : 'Device is stationary';

                const currentTimestamp = new Date().getTime();
                const timeDifference = (currentTimestamp - latestTime) / 1000 / 60; // Time difference in minutes

                if (timeDifference <= 4) {
                    lastOnlineElement.textContent = 'Device is online';
                } else {
                    lastOnlineElement.textContent = 'Device is offline. Last online: ' + new Date(latestTime).toLocaleString();
                }
            }

            if (latestTemperature > temperatureLimit) {
                warnings.push('Temperature exceeds safe limit!');
            }

            if (warnings.length > 0) {
                warningMessage.style.display = 'block';
                warningMessage.textContent = warnings.join(' ');
            } else {
                warningMessage.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('warningMessage').textContent = 'Error fetching data. Please try again later.';
            document.getElementById('warningMessage').style.display = 'block';
        });
}

document.getElementById('settingsButton').addEventListener('click', () => {
    const newLimit = parseFloat(prompt("Please enter your preferred temperature limit:"));
    if (!isNaN(newLimit)) {
        updateTemperatureLimit(newLimit);
    }
});

// Initialize the map
google.maps.event.addDomListener(window, 'load', initMap);
