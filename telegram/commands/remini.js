const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = (bot) => ({
  name: "remini",
  desc: "Enhanced photo",
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

            await bot.sendMessage(chatId, "⏱️ Your photo is being enhanced. Please wait...", {
                reply_to_message_id: messageID
            });

            const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/remini?imageUrl=${encodeURIComponent(photoUrl)}`);
            const processedImageUrl = response.data.image_data;

            const processedImageResponse = await axios.get(processedImageUrl, { responseType: 'stream' });

            const enhancedImagePath = path.join(__dirname, 'enhanced.jpg');
            const writeStream = fs.createWriteStream(enhancedImagePath);
            processedImageResponse.data.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            await bot.sendPhoto(chatId, fs.createReadStream(enhancedImagePath), {
                reply_to_message_id: messageID,
                caption: "🖼️ Your photo has been enhanced!"
            });

            fs.unlinkSync(enhancedImagePath);

        } catch (error) {
            console.error('Error processing image:', error);
            await bot.sendMessage(chatId, `❎ Error processing image: ${error}`, {
                reply_to_message_id: messageID
            });
        }
    } else {
        await bot.sendMessage(chatId, "⛔ Please reply to a photo to enhance it.", {
            reply_to_message_id: messageID
        });
    }
  }
});
