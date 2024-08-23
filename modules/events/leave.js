module.exports.config = {
  name: "leave",
  eventType: ['log:unsubscribe'],
  version: "1.0.0",
  credits: "Jonell Magallanes",
  description: "GROUP LEAVE NOTIFICATION"
};

module.exports.run = async function({ api, event }) {
  if (event.logMessageType === "log:unsubscribe") {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    try {
      let { threadName, participantIDs } = await api.getThreadInfo(event.threadID);
      const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left the group." : "kicked by Admin of the group";
      let name = (await api.getUserInfo(event.logMessageData.leftParticipantFbId))[event.logMessageData.leftParticipantFbId].name;

      api.shareContact(`${name} has been ${type}\nMember’s left: ${participantIDs.length}`, event.logMessageData.leftParticipantFbId, event.threadID);
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }
};
