const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
  const configPath = path.join('./config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));


  bot.onText(new RegExp(`^${config.prefix}`), (msg, match) => {
    const command = match.input.split(' ')[0];

    if (command === config.prefix) {
      const userName = msg.from.first_name;
      const greetingMessage = `Hello there ${userName}! Explore and enjoy using AI commands 🚀`;
      bot.sendMessage(msg.chat.id, greetingMessage);
    }
  });
};
