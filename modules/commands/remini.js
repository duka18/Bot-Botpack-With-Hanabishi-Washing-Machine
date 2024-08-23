const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "remini",
  version: "1.0.0",
  hasPermission: 0,
  description: "Enhanced photo",
  commandCategory: "Image",
  usages: "[reply to an image]",
  usePrefix: false,
  credits: "Jonell Magallanes",
  cooldowns: 2,
};
module.exports.run = async function ({ api, event, args }) {
  const pathie = './modules/commands/cache/enhanced.jpg';
  const { threadID, messageID } = event;

  const james = event.messageReply.attachments[0].url || args.join(" ");

  try {
    api.sendMessage("⏱️ | Your Photo is Enhancing. Please Wait....", threadID, messageID);

    const response = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/remini?imageUrl=${encodeURIComponent(james)}`);
    const processedImageURL = response.data.image_data;

    const imgResponse = await axios.get(processedImageURL, { responseType: "stream" });

    const writeStream = fs.createWriteStream(pathie);
    imgResponse.data.pipe(writeStream);

    writeStream.on('finish', () => {
      api.sendMessage({
        body: "🖼️ | Your Photo has been Enhanced!",
        attachment: fs.createReadStream(pathie)
      }, threadID, () => fs.unlinkSync(pathie), messageID);
    });
  } catch (error) {
    api.sendMessage(`❎ | Error processing image: ${error}`, threadID, messageID);
  }
};