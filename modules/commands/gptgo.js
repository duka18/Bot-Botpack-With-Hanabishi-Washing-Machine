const axios = require('axios');
const fs = require('fs');
const path = require('path');

const statusFilePath = path.join(__dirname, 'cache', 'stat.txt');

module.exports.config = {
    name: "gptgo",
    version: "1.0.0",
    hasPermission: 0,
    description: "Ask a question and receive a response. Can be turned on or off.",
    usePrefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 6,
    commandCategory: "Utilities",
};

const getStatus = () => {
    try {
        if (fs.existsSync(statusFilePath)) {
            return fs.readFileSync(statusFilePath, 'utf8').trim();
        }
        return 'on';
    } catch (error) {
        console.error("Error reading status file:", error);
        return 'on';
    }
};

const setStatus = (status) => {
    try {
        fs.writeFileSync(statusFilePath, status);
    } catch (error) {
        console.error("Error writing status file:", error);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const messageBody = event.body;
    const status = getStatus();

    if (status === 'on' && messageBody && event.isGroup) {
        if (messageBody.trim().startsWith('ai')) {
            return;
        }

        if (messageBody.trim().endsWith('?')) {
            try {
                api.setMessageReaction('✏️', event.messageID, () => { }, true);
                const response = await axios({
                    method: 'get',
                    url: `https://tools.revesery.com/ai/ai.php?query=${encodeURIComponent(messageBody.trim())}`,
                });

                const message = response.data?.data?.message || "No response message available.";
                  api.setMessageReaction('✅', event.messageID, () => { }, true);
                api.sendMessage(message, event.threadID, event.messageID);

            } catch (error) {
                console.error(error);
                api.sendMessage("An error occurred while trying to get a response.", event.threadID, event.messageID);
            }
        }
    }
};

module.exports.run = async function ({ api, event, args }) {
    const command = args[0];
    const question = args.slice(1).join(" ");

    if (command === 'on') {
        setStatus('on');
        return api.sendMessage("✅ | Notification for GPT responses is now ON.", event.threadID, event.messageID);
    }

    if (command === 'off') {
        setStatus('off');
        return api.sendMessage("✅ | Notification for GPT responses is now OFF.", event.threadID, event.messageID);
    }

    if (command === 'status') {
        const status = getStatus();
        return api.sendMessage(`Current notification status is **${status.toUpperCase()}**.`, event.threadID, event.messageID);
    }

    if (!question) {
        return api.sendMessage("Please provide a question to ask.", event.threadID, event.messageID);
    }

    try {
        const response = await axios({
            method: 'get',
            url: `https://tools.revesery.com/ai/ai.php?query=${encodeURIComponent(question)}`,
        });

        const message = response.data?.data?.message || "No response message available.";

        api.sendMessage(message, event.threadID, event.messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage("An error occurred while trying to get a response.", event.threadID, event.messageID);
    }
};
