// Import necessary modules
const mqtt = require('mqtt');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// MQTT Configuration options
const options = {
    port: 8883,                             // Secure MQTT port
    username: 'Madhav',                     // HiveMQ Cloud username
    password: 'Madhav@123',                 // HiveMQ Cloud password (masked)
    protocol: 'mqtts',                      // Secure MQTT connection
    rejectUnauthorized: true                // Enforce secure connection
};

// MQTT host details
const MQTT_HOST_NAME = 'a1b336084b384656a1da67d069d4575c.s1.eu.hivemq.cloud';
const mqttClient = mqtt.connect(`mqtts://${MQTT_HOST_NAME}`, options);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store subscriptions by client (in memory)
const clientSubscriptions = {};

// Handle MQTT client connection
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

// Handle incoming MQTT messages and print them to the terminal
mqttClient.on('message', (topic, message) => {
    console.log(`Received message: '${message.toString()}' on topic: '${topic}'`);
});

// Function to publish a message
function publish(topic, message, options = {}, callback) {
    mqttClient.publish(topic, message, options, (error) => {
        if (callback) {
            callback(error);
        }
    });
}

// Function to subscribe to a topic and listen for incoming messages
function subscribe(topic) {
    mqttClient.subscribe(topic, (error) => {
        if (error) {
            console.error('Subscription Error:', error);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
}

// Define routes
app.get('/', (req, res) => {
    res.render('index'); // Home page
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/settings', (req, res) => {
    res.render('settings');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

app.get('/reports', (req, res) => {
    res.render('reports');
});

app.get('/publishReports', (req, res) => {
    res.render('publisher');
});

// Sample report data
const reports = {
    report1: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        data: [10, 20, 30, 40, 50, 60]
    },
    report2: {
        labels: ['July', 'August', 'September', 'October', 'November', 'December'],
        data: [15, 25, 35, 45, 55, 65]
    },
    report3: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        data: [5, 15, 25, 35, 45, 55]
    }
};

// API route to fetch report data by report ID
app.get('/reports/:reportId', (req, res) => {
    const reportId = req.params.reportId;

    if (reports[reportId]) {
        res.json(reports[reportId]);
    } else {
        res.status(404).json({ error: 'Report not found' });
    }
});

// Route to render publisher page
app.get('/publisher', (req, res) => {
    res.render('publisher');
});

// Route to handle publishing MQTT messages
app.post('/publish', (req, res) => {
    const topic = req.body.topic;
    const message = req.body.msg;

    if (!topic || !message) {
        return res.status(400).json({ status: 400, message: 'Topic and message are required' });
    }

    publish(topic, message, {}, (error) => {
        if (error) {
            return res.status(400).json({ status: 400, message: error.message });
        }
        res.status(200).json({ status: 200, message: 'Successfully published MQTT Message' });
    });
});

// Route to handle subscribing to MQTT topics
app.post('/subscribe', (req, res) => {
    const topic = req.body.topic;

    if (!topic) {
        return res.status(400).json({ status: 400, message: 'Topic is required' });
    }

    subscribe(topic);

    res.status(200).json({ status: 200, message: `Subscribed to ${topic}` });
});

// Catch-all route for undefined paths
app.get('*', (req, res) => {
    res.status(404).send('<h1>Wrong Path</h1>');
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
