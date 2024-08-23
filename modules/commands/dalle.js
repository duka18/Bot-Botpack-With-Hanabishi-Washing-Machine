const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "dalle",
    hasPermssion: 0,
    version: "1.0.0",
    credits: "Jonell Magallanes",
    description: "Image Generator",
    usePrefix: false,
    commandCategory: "AI",
    usages: "[prompt]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const { messageID, threadID } = event;

    if (!args[0]) {
        return api.sendMessage("Please provide a prompt.\n\nExample: dalle a beautiful sunset over the mountains", threadID, messageID);
    }

    const prompt = args.join(" ");
    const url = `https://joshweb.click/dalle?prompt=${encodeURIComponent(prompt)}`;
const gen = await api.sendMessage("☁️ | Generating the image Please Wait......", event.threadID, event.messageID);
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageDir = path.join(__dirname, 'cache');
        const imagePath = path.join(imageDir, `${Date.now()}.png`);
        await fs.ensureDir(imageDir);
        await fs.writeFile(imagePath, response.data);

        api.sendMessage({
            body: `Here is your generated image\nPrompt: ${prompt}`,
            attachment: fs.createReadStream(imagePath)
        }, threadID, messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage(`${error.message}`, threadID, messageID);
    }
};
