require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.MY_CHAT_ID;

const bot = new TelegramBot(token);

console.log("🚀 Спроба відправити тестове повідомлення...");

bot.sendMessage(chatId, "Привіт, Siedoi.com! Це твій майбутній ДБЖ. Якщо ти це бачиш — зв'язок встановлено! 🔋")
    .then(() => {
        console.log("✅ ПЕРЕМОГА: Повідомлення в черзі на відправку!");
        process.exit(0); // Success exit
    })
    .catch((error) => {
        console.error("❌ ПОМИЛКА:");
        console.error(error.message);

        if (error.message.includes("404")) {
            console.log("👉 Порада: Перевір, чи вірний TOKEN.");
        } else if (error.message.includes("400")) {
            console.log("👉 Порада: Перевір CHAT_ID або чи ти натиснув START у самому боті.");
        }
        process.exit(1);
    });