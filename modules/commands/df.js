const axios = require('axios');

module.exports.config = {
    name: "df",
    hasPermssion: 0,
    version: "1.0.0",
    credits: "Jonell Magallanes",
    description: "searching your dream interpretations",
    usePrefix: false,
    commandCategory: "Search",
    usages: "[title] [page (optional, default=1)]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    try {
        if (args.length === 0) {
            return api.sendMessage("Please provide the title of your interpretation dream", event.threadID, event.messageID);
        }

        const title = args.join(' ').split('|')[0].trim();
        const pageArg = args.join(' ').split('|')[1];
        const page = pageArg ? pageArg.trim() : 1;

        const search = await api.sendMessage("🔎 | Searching your Dream Meaning......", event.threadID, event.messageID);
        const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/df?title=${title}&page=${page}`);

        if (response.data.success) {
            const data = response.data.data;
            let message = data.map(entry => `📝 Title: ${entry.title}\n🔗 Link: ${entry.link}\n📋 Description: ${entry.description}`).join("\n\n");

            api.editMessage(`☁️ 𝗗𝗿𝗲𝗮𝗺 𝗙𝗼𝗿𝘁𝗵𝗲𝗿\n━━━━━━━━━━━━━━━━━━\n📝 Dream Title Search: ${title}\n\n${message}\n━━━━━━━━━━━━━━━━━━`, search.messageID, event.threadID, event.messageID);
        } else {
            api.sendMessage("No results found.", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while fetching the data.", event.threadID, event.messageID);
    }
};
