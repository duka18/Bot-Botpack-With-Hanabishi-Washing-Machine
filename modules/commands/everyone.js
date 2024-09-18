module.exports.config = {
  name: "everyone",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Your Name",
  description: "Mention everyone in the chat",
  commandCategory: "group",
usePrefix: true,
  usages: "everyone",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async ({ api, event }) => {
  const threadID = event.threadID;

  api.getThreadInfo(threadID, (err, info) => {
    if (err) {
      api.sendMessage('An error occurred when fetching thread info.', threadID);
      return; // Stop execution if there is an error
    }
    
    const mentions = info.participantIDs
      .filter(id => id !== api.getCurrentUserID()) // Exclude the bot itself from mentions
      .map(id => ({ id, tag: 'everyone' }));

    if (mentions.length === 0) {
      api.sendMessage('No one to mention.', threadID);
      return; // Stop execution if there are no participants
    }

    const mentionText = mentions.map(m => `@${m.tag}`).join(' ');
    api.sendMessage({ body: mentionText, mentions }, threadID);
  });
};