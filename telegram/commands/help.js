const fs = require('fs');
const path = require('path');

module.exports = (bot) => ({
  name: "help",
  desc: "List all available commands",
  credit: "author here",
  onPrefix: false,
  cooldowns: 5,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const commandsPath = path.join(__dirname);

    try {
      const files = fs.readdirSync(commandsPath);
      let commandList = '\n━━━━━━━━━━━━━━━━━━\n📜 *Available Commands:*';

      files.forEach(file => {
        if (path.extname(file) === '.js' && file !== 'help.js') {
          const command = require(path.join(commandsPath, file))(bot);
          const prefixNeeded = command.onPrefix ? 'Yes' : 'No';
          commandList += `\n━━━━━━━━━━━━━━━━━━\n• *${command.name}*: ${command.desc}\n  - Prefix needed: ${prefixNeeded}\n━━━━━━━━━━━━━━━━━━\n`;
        }
      });

      bot.sendMessage(chatId, commandList, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error reading commands directory:', error);
      bot.sendMessage(chatId, 'An error occurred while fetching the command list.');
    }
  }
});
