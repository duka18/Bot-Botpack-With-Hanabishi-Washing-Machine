const axios = require('axios');
const fs = require('fs');
const path = require('path');

const regEx_tiktok = /https:\/\/(www\.|vt\.)?tiktok\.com\//;
const downloadsDir = path.join(__dirname, '..', 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

module.exports = (bot, config) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text || '';
    const messageEntities = msg.entities || [];

    if (messageEntities.length > 0) {
      for (const entity of messageEntities) {
        if (entity.type === 'url' && regEx_tiktok.test(messageText.substring(entity.offset, entity.offset + entity.length))) {
          const link = messageText.substring(entity.offset, entity.offset + entity.length);

          try {
            const response = await axios.post(`https://www.tikwm.com/api/`, { url: link });
            const data = response.data.data;

            const videoStream = await axios({
              method: 'get',
              url: data.play,
              responseType: 'stream'
            });

            const fileName = `TikTok-${Date.now()}.mp4`;
            const filePath = path.join(downloadsDir, fileName); // Save in 'downloads' folder
            const videoFile = fs.createWriteStream(filePath);

            videoStream.data.pipe(videoFile);

            videoFile.on('finish', () => {
              videoFile.close(() => {
                console.log('Downloaded video file.');
                const caption = `𝗔𝘂𝘁𝗼 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿 𝗧𝗶𝗸𝘁𝗼𝗸\n━━━━━━━━━━━━━━━━━━\n𝙲𝚘𝚗𝚝𝚎𝚗𝚝: ${data.title}\n\n𝙻𝚒𝚔𝚎𝚜: ${data.digg_count}\n\n𝙲𝚘𝚖𝚖𝚎𝚗𝚝𝚜: ${data.comment_count}`;
                bot.sendVideo(chatId, filePath, { caption })
                  .then(() => {
                    fs.unlinkSync(filePath); 
                  })
                  .catch((err) => {
                    console.error('Error sending TikTok video:', err);
                  });
              });
            });
          } catch (error) {
            console.error('Error downloading TikTok video:', error);
          }
        }
      }
    }
  });
};
