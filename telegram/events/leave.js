module.exports = (bot) => {
  bot.on('left_chat_member', (msg) => {
    const member = msg.left_chat_member;
    const action = msg.chat.type === 'group' || msg.chat.type === 'supergroup' ? 'kicked' : 'left';
    const leaveMessage = `${member.first_name} has been ${action} the chat.`;
    bot.sendMessage(msg.chat.id, leaveMessage);
  });
};
