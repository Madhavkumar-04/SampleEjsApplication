const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt'); // Ensure mqtt is installed and required
const path = require('path');

// Change this to point to your MQTT broker
const MQTT_HOST_NAME = 'mqtts://broker.hivemq.com:8883';


// Create an Express application
const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Initialize MQTT client
const mqttClient = mqtt.connect(MQTT_HOST_NAME);

// MQTT client connection handling
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

// Serve static files (e.g., for the publisher page)
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the publisher page
app.get('/publisher', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'views', 'publisher.html')); // Ensure you have a publisher.html file
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
});

// Route to handle publishing MQTT messages
app.post('/publish', (req, res) => {
    try {
        const topic = req.body.topic;
        const message = req.body.message;

        console.log(`Request Topic :: ${topic}`);
        console.log(`Request Message :: ${message}`);

        mqttClient.publish(topic, message, (error) => {
            if (error) {
                throw error;
            }
            res.status(200).json({ status: "200", message: "Successfully published MQTT Message" });
        });
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
