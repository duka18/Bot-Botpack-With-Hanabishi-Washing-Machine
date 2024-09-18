const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "echoreact",
  version: "1.2",
  hasPermssion: 0,
  credits: "Jonell Magallanes",
  description: "Auto react based on the emoji in the user's message",
  usePrefix: true,
  commandCategory: "No Prefix",
  usage: "Type ?autoreact on or ?autoreact off to enable or disable the feature.",
  cooldowns: 3,
};

const autoreactFilePath = path.join(__dirname, 'echoreact.txt');

module.exports.handleEvent = async function ({ api, event }) {
  if (event.body !== null && event.isGroup && (!event.attachments || event.attachments.length === 0)) {
    let autoreactStatus = 'off';
    if (fs.existsSync(autoreactFilePath)) {
      autoreactStatus = fs.readFileSync(autoreactFilePath, 'utf8').trim();
    }

    if (autoreactStatus === 'on') {
      const emojiMatch = event.body.match(/([\u{1F600}-\u{1F64F}])/u);
      if (emojiMatch && emojiMatch[0]) {
        const emoji = emojiMatch[0];
        api.setMessageReaction(emoji, event.messageID, () => { }, true);
      }
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const option = args[0]?.toLowerCase();

  if (option === 'on') {
    fs.writeFileSync(autoreactFilePath, 'on', 'utf8');
    api.sendMessage('Auto react has been enabled.', event.threadID);
  } else if (option === 'off') {
    fs.writeFileSync(autoreactFilePath, 'off', 'utf8');
    api.sendMessage('Auto react has been disabled.', event.threadID);
  } else {
    api.sendMessage('Invalid option. Use "?autoreact on" to enable or "?autoreact off" to disable auto reactions.', event.threadID);
  }
};
