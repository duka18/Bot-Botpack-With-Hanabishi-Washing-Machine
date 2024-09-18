module.exports = (bot) => {
  bot.on('new_chat_members', (msg) => {
    const chatTitle = msg.chat.title;
    const newMembers = msg.new_chat_members;
    const memberCount = msg.chat.members_count;

    newMembers.forEach((member) => {
      const welcomeMessage = `Hello there ${member.first_name}! Welcome to ${chatTitle}. You are now the ${memberCount} member of this group. Good luck exploring! 🎉`;
      bot.sendMessage(msg.chat.id, welcomeMessage);
    });
  });
};
