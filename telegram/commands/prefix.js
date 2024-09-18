const fs = require('fs');
const path = require('path');

module.exports = (bot) => ({
  name: "prefix",
  desc: "Show the current command prefix",
  credit: "Jonell Magallanes",
  onPrefix: false,
  cooldowns: 5,

  execute: async (msg) => {
    const chatId = msg.chat.id;

    
    const configPath = path.join( './config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const currentPrefix = config.prefix || '/'; 

    bot.sendMessage(chatId, `This is my current prefix => ${currentPrefix}`);
  }
});
