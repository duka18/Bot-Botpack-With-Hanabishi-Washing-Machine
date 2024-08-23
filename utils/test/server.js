"use strict";

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const urlGdpsFilePath = path.join(__dirname, 'gdps', 'urlgdps.json');
let urlGdpsData = {};

if (fs.existsSync(urlGdpsFilePath)) {
    const rawData = fs.readFileSync(urlGdpsFilePath);
    urlGdpsData = JSON.parse(rawData);
}

module.exports = {
    name: "servercheck",
    usedby: 0,
    info: "Check server",
    onPrefix: true,
    dev: "Jonell Magallanes ",
    cooldowns: 10,

onLaunch: async function ({ api, event }) {
    const servers = Object.values(urlGdpsData).map(({ url }) => url);

    const checkingMessage = await api.sendMessage("🔍 | Checking server status...", event.threadID);

    const checkServer = async (server) => {
        try {
            const response = await axios.get(server, { timeout: 5000 });
            return `✅ ${response.status}`;
        } catch (error) {
            if (error.response) {
                return `❌ ${error.response.status}`;
            } else if (error.request) {
                return '❌ No response received';
            } else {
                return '❌ Error';
            }
        }
    };

    const results = await Promise.allSettled(
        servers.map(server => checkServer(server))
    );

    let status = {};
    Object.keys(urlGdpsData).forEach((key, index) => {
        status[urlGdpsData[key].name] = results[index].value;
    });

    let response = `📭 𝗦𝗲𝗿𝘃𝗲𝗿 𝗚𝗗𝗣𝗦\n━━━━━━━━━━━━━━━━━━\n`;

    for (const [server, stat] of Object.entries(status)) {
        response += `${server}: ${stat}\n`;
    }

    const upCount = Object.values(status).filter(stat => stat.startsWith('✅')).length;
    const downCount = Object.values(status).filter(stat => stat.startsWith('❌')).length;

    if (upCount === Object.keys(status).length) {
        response += "\nAll servers are up.";
    } else if (downCount === Object.keys(status).length) {
        response += "\nAll servers are down.";
    } else {
        response += `\n${upCount} server(s) are up, ${downCount} server(s) are down.`;
    }

    api.editMessage(response, checkingMessage.messageID, event.threadID, event.messageID);
}
}
