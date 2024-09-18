const axios = require('axios');

module.exports.config = {
  name: "uid",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Mirai Team",
  description: "Get the user's Facebook UID.",
  usePrefix: true,
  commandCategory: "other",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const messageText = event.messageText;
  
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = messageText.match(urlPattern);

  if (urls && urls.length > 0) {
    const url = urls[0];
    
    try {
      const response = await axios.get(`https://ccexplorerapisjonell.vercel.app/api/fb?url=${url}`);
      const { code } = response.data;
      const uid = code.replace(/\D/g, '');
      api.sendMessage(`UID: ${uid}`, event.threadID);
    } catch (error) {
      console.error("Error fetching data from API:", error);
      api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
  } else {
    if (Object.keys(event.mentions).length === 0) {
      if (event.messageReply) {
        const senderID = event.messageReply.senderID;
        api.sendMessage(senderID, event.threadID);
      } else {
        api.shareContact(`${event.senderID}`, event.messageReply.senderID, event.threadID, event.messageID);
      }
    } else {
      for (const mentionID in event.mentions) {
        const mentionName = event.mentions[mentionID];
        api.shareContact(`${mentionName.replace('@', '')}: ${mentionID}`, mentionName, event.threadID);
      }
    }
  }
};
