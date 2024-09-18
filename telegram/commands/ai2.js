const axios = require('axios');

module.exports = (bot) => ({
  name: "ai2",
  desc: "Ask a question and get an educational response",
  credit: "Jonell Magallanes",
  onPrefix: false,
  cooldowns: 5,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
      if (!text) {
        return bot.sendMessage(chatId, "Please provide your question.\n\nExample: /ai2 how are you?");
      }

      const lad = await bot.sendMessage(chatId, "🔎 Searching for an answer. Please wait...");

      const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/gpt4?text=${encodeURIComponent(text)}`);

      if (response.data.status && response.data.result && response.data.result.status && response.data.result.result) {
        const responseMessage = `𝗖𝗛𝗔𝗧𝗚𝗣𝗧 𝟰\n━━━━━━━━━━━━━━━━━━\n${response.data.result.result}\n━━━━━━━━━━━━━━━━━━`;
        bot.editMessage(responseMessage, { chatId, messageId: lad.message_id });
      } else {
        bot.sendMessage(chatId, "An error occurred while processing your request.");
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, "An error occurred while processing your request.");
    }
  }
});
