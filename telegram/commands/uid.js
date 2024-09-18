module.exports = (bot) => ({
  name: "uid",
  desc: "Shows your Telegram user ID",
  credit: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 5,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    bot.sendMessage(chatId, `Your Telegram user ID is: ${userId}`);
  }
});
