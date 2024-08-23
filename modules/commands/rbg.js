const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "removebg",
  hasPermission: 0,
  version: "1",
  description: "Remove Background Image",
  usePrefix: false,
  credits: "Jonell Magallanes",
  commandCategory: "Image",
  cooldowns: 2,
};
module.exports.run = async function ({ api, event, args })  {
  const pathie = './modules/commands/cache/removed_bg.png';
  const { threadID, messageID } = event;

  const photoLink = event.messageReply.attachments[0].url || args.join(" ");

  try {
    api.sendMessage("⏳ | Removing background from your image...", threadID, messageID);

    const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/rbg?imageUrl=${encodeURIComponent(photoLink)}`);
    const removedBgImageUrl = response.data.image_data;

    const imgResponse = await axios.get(removedBgImageUrl, { responseType: "stream" });

    const writeStream = fs.createWriteStream(pathie);
    imgResponse.data.pipe(writeStream);

    writeStream.on('finish', () => {
      api.sendMessage({
        body: "✅ | Background removed successfully",
        attachment: fs.createReadStream(pathie)
      }, threadID, () => fs.unlinkSync(pathie), messageID);
    });
  } catch (error) {
    api.sendMessage(`❎ | Error removing background: ${error}`, threadID, messageID);
  }
};