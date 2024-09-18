const fs = require('fs');
const axios = require('axios');

module.exports = (bot) => ({
  name: "maintenance",
  desc: "Put the bot into maintenance mode",
  credit: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 5,
  onlyAdmins: true,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const authorizedUserId = 5101069743;
    const text = msg.text;
    const args = text.split(' ').slice(1);
    const content = args.join(' ');

    if (userId !== authorizedUserId) {
      return bot.sendMessage(chatId, "You are not authorized to use this command.");
    }

    if (!content) {
      return bot.sendMessage(chatId, "Please provide a reason for maintenance.\n\nExample: /maintenance Server upgrade.");
    }

    try {
      const link = "https://i.postimg.cc/NFdDc0vV/RFq-BU56n-ES.gif";
      const response = await axios.get(link, { responseType: 'stream' });
      const path = __dirname + "/cache/maintenance.gif";
      const writer = fs.createWriteStream(path);

      response.data.pipe(writer);

      writer.on('finish', async () => {
        const chats = await bot.getChatAdministrators(chatId);

        for (let i = 0; i < chats.length; i++) {
          const chat = chats[i];
          if (chat.isGroup && chat.id !== chatId) {
            await bot.sendMessage(chat.id, {
              text: `𝗕𝗼𝘁 𝗠𝗮𝗶𝗻𝘁𝗲𝗻𝗮𝗻𝗰𝗲 𝗠𝗼𝗱𝗲\n━━━━━━━━━━━━━━━━━━\nThe bot is now in maintenance mode. Please be patient.\n\nReason: ${content}\n\nDeveloper: ${global.config.OWNER}`,
              attachments: [fs.createReadStream(path)]
            });
          }
        }

        console.log("The bot is now off for maintenance.");
        process.exit(0);
      });

      writer.on('error', (err) => {
        console.error('Error writing file:', err);
        bot.sendMessage(chatId, "An error occurred while trying to download the maintenance image.");
      });
    } catch (error) {
      console.error('Error fetching maintenance image:', error);
      bot.sendMessage(chatId, "An error occurred while trying to put the bot into maintenance mode.");
    }
  }
});
