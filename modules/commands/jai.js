const axios = require('axios');

module.exports.config = {
    name: "jai",
    hasPermssion: 0,
    version: "1.0.0",
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: false,
    commandCategory: "AI",
    usages: "[question]",
    cooldowns: 5,
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { messageID, threadID } = event;

    try {
        const lad = await api.sendMessage("🔎 Searching for an answer. Please wait...", threadID, messageID);
        const response = await axios.get(`https://hiroshi-rest-api.replit.app/ai/jailbreak?ask=${encodeURIComponent(event.body)}`);

        if (response.data.response) {
            const responseMessage = `𝗖𝗛𝗔𝗧𝗚𝗣𝗧 𝗝𝗮𝗶𝗹𝗯𝗿𝗲𝗮𝗸 \n━━━━━━━━━━━━━━━━━━\n${response.data.response}\n━━━━━━━━━━━━━━━━━━\n`;
            api.editMessage(responseMessage, lad.messageID, threadID, messageID);
        } else {
            api.sendMessage("An error occurred while processing your request.", threadID, messageID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { messageID, threadID } = event;

    if (!args[0]) return api.sendMessage("Please provide your question.\n\nExample: jai what is the solar system?", threadID, messageID);

    try {
        const lad = await api.sendMessage("🔎 Searching for an answer. Please wait...", threadID, messageID);
        const response = await axios.get(`https://hiroshi-rest-api.replit.app/ai/jailbreak?ask=${encodeURIComponent(args.join(" "))}`);

        if (response.data.response) {
            const responseMessage = `𝗖𝗛𝗔𝗧𝗚𝗣𝗧 𝗝𝗮𝗶𝗹𝗯𝗿𝗲𝗮𝗸 \n━━━━━━━━━━━━━━━━━━\n${response.data.response}\n━━━━━━━━━━━━━━━━━━\n`;
            api.editMessage(responseMessage, lad.messageID, threadID, messageID);
        } else {
            api.sendMessage("An error occurred while processing your request.", threadID, messageID);
        }
        global.client.handleReply.push({
            name: this.config.name,
            messageID: lad.messageID,
            author: event.senderID
        });
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
};
