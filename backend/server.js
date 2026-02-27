const mqtt = require('mqtt');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config'); // Наші глобальні константи

// 1. Ініціалізація зв'язку
const client = mqtt.connect(config.mqtt.url);
const bot = new TelegramBot(config.telegram.token, { polling: false });

// 2. Подія "Connect" — спрацьовує один раз при успішному підключенні
client.on('connect', () => {
    console.log(`📡 Siedoi.com: Підключено до брокера: ${config.mqtt.url}`);

    // Ми "підписуємося" на канал. Без цього брокер не буде слати нам дані.
    client.subscribe(config.mqtt.topicTelemetry, (err) => {
        if (!err) console.log(`✅ Підписка на топік: ${config.mqtt.topicTelemetry}`);
    });
});

// 3. Подія "Message" — головний цикл. Спрацьовує щоразу, коли ESP32 щось пушить
client.on('message', (topic, message) => {
    // message приходить як Buffer (набір байтів), перетворюємо в рядок
    const rawData = message.toString();

    try {
        const data = JSON.parse(rawData); // Перетворюємо JSON у JS-об'єкт
        processTelemetry(data); // Виносимо логіку в окрему функцію
    } catch (e) {
        console.error("❌ Помилка в даних:", rawData);
    }
});

// 4. Функція-обробник (Твій бізнес-інтелект)
function processTelemetry(data) {
    const { grid, battery, env } = data;

    // ПЕРЕВІРКА 1: Світло зникло
    if (!grid.online) {
        sendAlert(`🚨 Світло зникло! Працюємо від АКБ: ${battery.percent}%`);
    }

    // ПЕРЕВІРКА 2: Низький заряд
    if (battery.percent < config.thresholds.lowBattery) {
        sendAlert(`⚠️ Увага! Критичний заряд: ${battery.percent}%`);
    }

    // ПЕРЕВІРКА 3: Перегрів (важливо для закритих шаф)
    if (env.temp > config.thresholds.tempAlert) {
        sendAlert(`🔥 ПЕРЕГРІВ! Температура: ${env.temp}°C`);
    }
}

function sendAlert(text) {
    bot.sendMessage(config.telegram.chatId, text);
    console.log(`📢 Telegram Alert: ${text}`);
}