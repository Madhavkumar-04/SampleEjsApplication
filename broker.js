const mqtt = require('mqtt');

const MQTT_HOST_NAME = 'mqtts://broker.hivemq.com:8883';

const mqttClient = mqtt.connect(MQTT_HOST_NAME);

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

module.exports = {
    publish,
    subscribe
};
