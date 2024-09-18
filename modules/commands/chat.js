module.exports.config = {
  name: "chat",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Jonell Magallanes",
  description: "",
    usePrefix: true,
  commandCategory: "Risk",
  usages: "[on/off]",
  cooldowns: 10
};
async function getUserName(api, senderID) {
try {
  const userInfo = await api.getUserInfo(senderID);
  return userInfo[senderID]?.name || "User";
} catch (error) {
  console.log(error);
  return "User";
}
}
var chat = {};

module.exports.handleEvent = async function({api, event}) {
  if (!Object.keys(chat).includes(String(event.threadID))) return;

  const botID = api.getCurrentUserID();
  if (event.senderID === botID) return;

  const threadInfo = await api.getThreadInfo(event.threadID);

  // Check if the event sender is an admin
  const isAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === event.senderID);

  // Check if the sender is bot admin
  const isBotAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === botID);

  // The bot will not remove users if chat is off and the sender is an admin,
  // or the bot itself has been removed from admins
  if (chat[String(event.threadID)] && !isAdmin && isBotAdmin) {
     api.removeUserFromGroup(event.senderID, event.threadID); api.sendMessage(`${await getUserName(api, event.senderID)} has been removed from the group due the chat off has activated declared by Administrator group.`, event.threadID, event.messageID);
  }
};

module.exports.onLoad = function() {
  const { readFileSync, existsSync, writeFileSync } = require("fs");
  const path = __dirname + "/cache/chat.json";
  if (existsSync(path)) {
      chat = JSON.parse(readFileSync(path));
  } else {
      writeFileSync(path, JSON.stringify({}), 'utf-8');
  }
};

module.exports.run = async function({ api, event, args }) {
  const { writeFileSync } = require("fs");
  const path = __dirname + "/cache/chat.json";

  if (!(String(event.threadID) in chat)) chat[String(event.threadID)] = false;

  const threadInfo = await api.getThreadInfo(event.threadID);
  // Check if the sender is an admin
  const isAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === event.senderID);

  // Only allow admin to change chat settings
  if (isAdmin) {
      if (args[0] === "off") {
          chat[String(event.threadID)] = true;
          writeFileSync(path, JSON.stringify(chat), 'utf-8');
          return api.sendMessage(`🛡️ | Chat off has been Activated. The bot will now remove non-admin members from the group when they chat.`, event.threadID);
      } else if (args[0] === "on") {
          chat[String(event.threadID)] = false;
          writeFileSync(path, JSON.stringify(chat), 'utf-8');
          return api.sendMessage(`✅  | Chat off has been Deactivated. The bot will no longer remove members when they chat.`, event.threadID);
      } else {
          return api.sendMessage('Use the command "chat on" to enable or "chat off" to disable chat.', event.threadID);
      }
  } else {
      return api.sendMessage("Admin privilege is required to change chat settings.", event.threadID);
  }
};