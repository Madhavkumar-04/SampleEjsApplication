// Import necessary modules
const mqtt = require('mqtt');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MQTT Configuration
const MQTT_HOST_NAME = 'mqtts://broker.hivemq.com:8883';
const mqttClient = mqtt.connect(MQTT_HOST_NAME);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle MQTT client connection
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});

// Function to publish a message
function publish(topic, message, options = {}, callback) {
    mqttClient.publish(topic, message, options, (error) => {
        if (callback) {
            callback(error);
        }
    });
}

// Function to subscribe to a topic
function subscribe(topic, callback) {
    mqttClient.subscribe(topic, (error) => {
        if (error) {
            console.error('Subscription Error:', error);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });

    mqttClient.on('message', (topic, message) => {
        if (callback) {
            callback(topic, message.toString());
        }
    });
}

// Maintain a record of client subscriptions
const clientSubscriptions = new Map();

// Define routes
app.get('/', (req, res) => {
    res.render('index'); // Home page
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/dashboard/data', (req, res) => {
    const chartData = generateRandomData();
    res.json(chartData);
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
    const topic = req?.body?.topic;
    const message = req?.body?.msg;

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

// Route to render subscriber page
app.get('/subscriber', (req, res) => {
    res.render('hello'); // Render the subscriber page
});

// Route to handle subscribing to MQTT topics
app.post('/subscribe', (req, res) => {
    const topic = req?.body?.topic;

    if (!topic) {
        return res.status(400).json({ status: 400, message: 'Topic is required' });
    }

    // Update clientSubscriptions map
    const socketId = req.body.socketId; // Assuming socketId is passed in request
    if (!clientSubscriptions.has(socketId)) {
        clientSubscriptions.set(socketId, new Set());
    }
    const subscriptions = clientSubscriptions.get(socketId);
    subscriptions.add(topic);

    subscribe(topic, (topic, message) => {
        // Emit message only to subscribed clients
        io.to(socketId).emit('mqttMessage', { topic, message });
    });

    res.status(200).json({ status: 200, message: `Subscribed to ${topic}` });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected to Socket.IO');

    // Initialize client subscription record
    clientSubscriptions.set(socket.id, new Set());

    // Handle subscription requests from clients
    socket.on('subscribe', (topic) => {
        const subscriptions = clientSubscriptions.get(socket.id);
        subscriptions.add(topic);

        subscribe(topic, (topic, message) => {
            socket.emit('mqttMessage', { topic, message });
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected from Socket.IO');
        // Clean up subscriptions on disconnect
        clientSubscriptions.delete(socket.id);
    });
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
