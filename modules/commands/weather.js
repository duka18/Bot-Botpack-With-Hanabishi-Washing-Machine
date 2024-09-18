const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, 'cache', 'weatherDatabase.json');

function ensureDatabase() {
    const cacheDir = path.dirname(databasePath);
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (!fs.existsSync(databasePath)) {
        fs.writeFileSync(databasePath, JSON.stringify({}), 'utf8');
    }
}

function loadDatabase() {
    ensureDatabase();
    return JSON.parse(fs.readFileSync(databasePath, 'utf8'));
}

function saveDatabase(data) {
    ensureDatabase();
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports.config = {
    name: "weather",
    version: "1.0.0",
    hasPermission: 0,
    description: "Get weather information and manage notifications",
    usePrefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 6,
    commandCategory: "Weather",
};

module.exports.run = async function ({ api, event, args }) {
    const db = loadDatabase();
    const threadID = event.threadID;
    const command = args[0];
    const status = args[1];

    if (command === 'weather') {
        if (status === 'on') {
            db[threadID] = { enabled: true };
            saveDatabase(db);
            return api.sendMessage(`Thread ${threadID} notifications are now ON`, threadID);
        } else if (status === 'off') {
            db[threadID] = { enabled: false };
            saveDatabase(db);
            return api.sendMessage(`Thread ${threadID} notifications are now OFF`, threadID);
        }
    }

    if (command === 'status') {
        const enabled = db[threadID] && db[threadID].enabled;
        return api.sendMessage(`Status Alert Notification Weather: This Thread is ${enabled ? 'ON' : 'OFF'}`, threadID);
    }
};

cron.schedule('* * * * *', async () => {
    const db = loadDatabase();
    for (const [threadID, settings] of Object.entries(db)) {
        if (settings.enabled) {
            try {
                const response = await axios.get('https://ccexplorerapisjonell.vercel.app/api/weather');
                const data = response.data;
                const weatherInfo = `
                    ${data.synopsis}\n
                    Issued at: ${data.issuedAt}\n
                    Max Temperature: ${data.temperature.max.value} at ${data.temperature.max.time}\n
                    Min Temperature: ${data.temperature.min.value} at ${data.temperature.min.time}\n
                    Max Humidity: ${data.humidity.max.value} at ${data.humidity.max.time}\n
                    Min Humidity: ${data.humidity.min.value} at ${data.humidity.min.time}
                `;
                await api.sendMessage(weatherInfo, threadID);
            } catch (error) {
                await api.sendMessage(`Error fetching weather data: ${error.response ? error.response.status : error.message}`, threadID);
            }
        }
    }
});
