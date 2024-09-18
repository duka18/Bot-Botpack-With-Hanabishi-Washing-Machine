module.exports = (bot) => ({
  name: "cmd",
  desc: "Reload a specific command module",
  credit: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 5,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const args = msg.text.split(" ").slice(2);
    const commandName = args[0];

    if (!['5101069743'].includes(userId.toString())) {
      return bot.sendMessage(chatId, "You are not authorized to use this command.");
    }

    if (!commandName) {
      return bot.sendMessage(chatId, "Please provide the name of the command to reload.\n\nExample: /cmd load image");
    }

    try {
      const commandPath = `./commands/${commandName}.js`;

      if (!require('fs').existsSync(commandPath)) {
        return bot.sendMessage(chatId, `The command "${commandName}" does not exist.`);
      }

      delete require.cache[require.resolve(commandPath)];
      require(commandPath)(bot);

      bot.sendMessage(chatId, `The command "${commandName}" has been reloaded successfully.`);
    } catch (error) {
      console.error('Error reloading command:', error);
      bot.sendMessage(chatId, `An error occurred while reloading the command "${commandName}".`);
    }
  }
});
