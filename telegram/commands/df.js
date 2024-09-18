const axios = require('axios');

module.exports = (bot) => ({
  name: "df",
  desc: "Search for dream interpretations",
  credit: "Jonell Magallanes",
  onPrefix: false,
  cooldowns: 5,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) {
      return bot.sendMessage(chatId, "Please provide the title of your interpretation dream.");
    }

    const [title, pageArg] = text.split('|').map(arg => arg.trim());
    const page = pageArg ? pageArg : 1;

    try {
      const searchMessage = await bot.sendMessage(chatId, "🔎 | Searching your Dream Meaning......");

      const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/df?title=${encodeURIComponent(title)}&page=${page}`);

      if (response.data.success) {
        const data = response.data.data;
        let message = data.map(entry => `📝 Title: ${entry.title}\n🔗 Link: ${entry.link}\n📋 Description: ${entry.description}`).join("\n\n");

        await bot.editMessageText(`☁️ 𝗗𝗿𝗲𝗮𝗺 𝗙𝗼𝗿𝘁𝗵𝗲𝗿\n━━━━━━━━━━━━━━━━━━\n📝 Dream Title Search: ${title}\n\n${message}\n━━━━━━━━━━━━━━━━━━`, {
          chat_id: chatId,
          message_id: searchMessage.message_id
        });
      } else {
        await bot.sendMessage(chatId, "No results found.");
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
      await bot.sendMessage(chatId, "An error occurred while fetching the data.");
    }
  }
});
