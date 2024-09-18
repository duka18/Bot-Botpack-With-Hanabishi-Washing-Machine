const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = (bot) => ({
  name: "removebg",
  desc: "Remove Background Image",
  credit: "Jonell Magallanes",
  onPrefix: false,
  cooldowns: 2,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const { threadID, messageID } = msg;

    if (msg.reply_to_message && msg.reply_to_message.photo) {
      try {
        const fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
        const photoFile = await bot.getFile(fileId);
        const photoUrl = `https://api.telegram.org/file/bot${bot.token}/${photoFile.file_path}`;

        await bot.sendMessage(chatId, "⏳ Removing background from your image...", {
          reply_to_message_id: messageID
        });

        const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/rbg?imageUrl=${encodeURIComponent(photoUrl)}`);
        const removedBgImageUrl = response.data.image_data;

        const imgResponse = await axios.get(removedBgImageUrl, { responseType: "stream" });

        const removedBgImagePath = path.join(__dirname, 'removed_bg.png');
        const writeStream = fs.createWriteStream(removedBgImagePath);
        imgResponse.data.pipe(writeStream);

        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        await bot.sendPhoto(chatId, fs.createReadStream(removedBgImagePath), {
          reply_to_message_id: messageID,
          caption: "✅ Background removed successfully"
        });

        fs.unlinkSync(removedBgImagePath);

      } catch (error) {
        console.error('Error removing background:', error);
        await bot.sendMessage(chatId, `❎ Error removing background: ${error}`, {
          reply_to_message_id: messageID
        });
      }
    } else {
      await bot.sendMessage(chatId, "⛔ Please reply to a photo to remove its background.", {
        reply_to_message_id: messageID
      });
    }
  }
});
