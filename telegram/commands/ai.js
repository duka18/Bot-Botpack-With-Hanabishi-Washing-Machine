const axios = require('axios');

module.exports = (bot) => ({
  name: "ai",
  desc: "Ask Questions",
  credit: "Jonell Magallanes",
  onPrefix: false,
  cooldowns: 10,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.first_name; 
    const text = msg.text;
    const query = text.substring(text.indexOf(' ') + 1);

    if (!query) {
      return bot.sendMessage(chatId, "Please provide your question.\n\nExample: ai what is the solar system?");
    }

    const apiUrl = `https://jonellccprojectapis10.adaptable.app/api/gptconvo?ask=${encodeURIComponent(query)}&id=${userId}`;

    try {
      const initialMessage = await bot.sendMessage(chatId, "🔎 Searching for an answer. Please wait...");

      if (msg.reply_to_message && msg.reply_to_message.photo) {
        const fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
        const file = await bot.getFile(fileId);
        const imageURL = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

        const geminiUrl = `https://joshweb.click/gemini?prompt=${encodeURIComponent(query)}&url=${encodeURIComponent(imageURL)}`;
        const geminiResponse = await axios.get(geminiUrl);
        const caption = geminiResponse.data.gemini;

        if (caption) {
          const geminiMessage = `𝗚𝗲𝗺𝗶𝗻𝗶 𝗩𝗶𝘀𝗶𝗼𝗻 𝗣𝗿𝗼 𝗜𝗺𝗮𝗴𝗲 𝗥𝗲𝗰𝗼𝗴𝗻𝗶𝘁𝗶𝗼𝗻\n━━━━━━━━━━━━━━━━━━\n${caption}\n━━━━━━━━━━━━━━━━━━\n`;
          await bot.editMessageText(geminiMessage, { chat_id: chatId, message_id: initialMessage.message_id });
        } else {
          await bot.sendMessage(chatId, "🤖 Failed to recognize the image.");
        }
        return;
      }

      const response = await axios.get(apiUrl);
      const { response: result } = response.data;
      const responseMessage = `𝗖𝗛𝗔𝗧𝗚𝗣𝗧\n━━━━━━━━━━━━━━━━━━\n${result}\n\n👤 Asked Questions: ${userName}\n━━━━━━━━━━━━━━━━━━`;

      await bot.editMessageText(responseMessage, { chat_id: chatId, message_id: initialMessage.message_id });
    } catch (error) {
      console.error('Error fetching data from API:', error);
      bot.sendMessage(chatId, error.message);
    }
  }
});
