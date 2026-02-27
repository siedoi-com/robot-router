require('dotenv').config();
const mqtt = require('mqtt');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

let lastGridStatus = true; // We keep the last known grid status

// 1. Connection
const client = mqtt.connect(config.mqtt.url);
const bot = new TelegramBot(config.telegram.token);

// 2. Connection events
client.on('connect', () => {
    console.log(`📡 Siedoi.com: Сервер успішно підключився до брокера на ${config.mqtt.url}`);

    // We "subscribe" to the channel. Without this, the broker won't send us data.
    client.subscribe(config.mqtt.topicTelemetry, (err) => {
        if (!err) {
            console.log(`✅ Ми підписалися на канал: ${config.mqtt.topicTelemetry}`);
        } else {
            console.error("❌ Помилка підписки:", err);
        }
    });
});

// 3. Message events
client.on('message', (topic, message) => {
    // 1. Convert bytes to string
    const rawString = message.toString();

    try {
        // 2. Try to parse JSON
        const data = JSON.parse(rawString);
        console.log(`📊 Отримано дані від [${data.device_id}]`);

        // 3. Call our processing function (we'll create it below)
        processLogic(data);

    } catch (error) {
        console.error("❌ Помилка: прийшов невалідний JSON", rawString);
    }
});

function processLogic(data) {
    const { grid, battery } = data; // Destructuring (getting what we need)

    // If the light was on (true), but it's off (false)
    if (lastGridStatus === true && grid.online === false) {
        const message = `🚨 Siedoi.com, світло ЗНИКЛО!\n🔋 Заряд батареї: ${battery.percent}%`;
        bot.sendMessage(config.telegram.chatId, message);
        console.log("📢 Відправлено алярм про знеструмлення");
    }

    // If the light was off (false), but it's on (true)
    if (lastGridStatus === false && grid.online === true) {
        const message = `✅ Siedoi.com, світло З'ЯВИЛОСЯ!\n🔌 Система переходить на зарядку.`;
        bot.sendMessage(config.telegram.chatId, message);
        console.log("📢 Відправлено радісну звістку про світло");
    }

    // Update status for next check
    lastGridStatus = grid.online;
}