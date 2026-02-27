require('dotenv').config();

module.exports = {
    mqtt: {
        url: process.env.MQTT_URL || 'mqtt://localhost:1883',
        topicTelemetry: 'v1/devices/sentinel-01/telemetry',
        topicCommands: 'v1/devices/sentinel-01/commands',
    },
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
        chatId: process.env.MY_CHAT_ID,
    },
    thresholds: {
        lowBattery: 20, // Відсоток, при якому слати алярм
        tempAlert: 45,  // Температура перегріву
    }
};