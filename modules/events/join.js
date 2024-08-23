module.exports.config = {
  name: "join",
  eventType: ['log:subscribe'],
  version: "1.0.0",
  credits: "Jonell Magallanes",
  description: "GROUP UPDATE NOTIFICATION"
};

module.exports.run = function({ api, event }) {
  if (event.logMessageType === "log:subscribe") {
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      api.changeNickname(`${global.config.BOTNAME} • [ ${global.config.PREFIX} ]`, event.threadID, api.getCurrentUserID());
      return api.shareContact(`✅ 𝗕𝗼𝘁 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n${global.config.BOTNAME} Bot connected successfully!\nType "${global.config.PREFIX}help" to view all commands\n\nContact: ${global.config.OWNER}`, api.getCurrentUserID(), event.threadID);
    } else {
      const { threadID } = event;
      api.getThreadInfo(threadID, async (err, threadInfo) => {
        if (err) return console.error(err);

        let { threadName, participantIDs } = threadInfo;
        var tn = threadName || "Unnamed group";
        let addedParticipants = event.logMessageData.addedParticipants;

        for (let newParticipant of addedParticipants) {
          let userID = newParticipant.userFbId;
          api.getUserInfo(parseInt(userID), (err, data) => {
            if (err) return console.error(err);

            var obj = Object.keys(data);
            var userName = data[obj].name.replace("@", "");

            if (userID !== api.getCurrentUserID()) {
              api.shareContact(`Hello ${userName}!\nWelcome to ${tn}\nYou're the ${participantIDs.length}th member on this group. Enjoy!`, newParticipant.userFbId, event.threadID);
            }
          });
        }
      });
    }
  }
};
