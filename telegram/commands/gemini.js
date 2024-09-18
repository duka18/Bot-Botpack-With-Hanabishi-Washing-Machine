const axios = require('axios');

module.exports = (bot) => ({
  name: "gemini",
  desc: "Educational AI",
  credit: "Jonell Magallanes",
  onPrefix: false,
  cooldowns: 5,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const { message_id: messageID, text: question } = msg;

    if (!question) {
      await bot.sendMessage(chatId, "⛔ Please provide your question or request.\n\nExample: Gemini write a story about a young girl who discovers a magical portal in her backyard.", {
        reply_to_message_id: messageID
      });
      return;
    }

    try {
      const findingMessage = await bot.sendMessage(chatId, "🔎 Searching for an answer. Please wait...", {
        reply_to_message_id: messageID
      });

      const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/gen?ask=${encodeURIComponent(question)}`);

      if (response.data.result) {
        await bot.editMessageText(`𝗚𝗲𝗺𝗶𝗻𝗶 𝗔𝗜\n━━━━━━━━━━━━━━━━━━\n${response.data.result}\n━━━━━━━━━━━━━━━━━━`, {
          chat_id: chatId,
          message_id: findingMessage.message_id
        });
      } else {
        await bot.sendMessage(chatId, "An error occurred while processing your request.", {
          reply_to_message_id: messageID
        });
      }
    } catch (error) {
      console.error(error);
      await bot.sendMessage(chatId, "An error occurred while processing your request.", {
        reply_to_message_id: messageID
      });
    }
  }
});
