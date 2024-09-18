const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "gptauto",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Jonell Magallanes",
  description: "asking questions without prefix or command",
  usePrefix: false,
  commandCategory: "ai",
  usages: "[ask]",
  cooldowns: 2
};

function isGptEnabled() {
  try {
    const status = fs.readFileSync('gpt.txt', 'utf8');
    return status.trim() === "on";
  } catch (error) {
    console.error("Error reading gpt.txt:", error);
    return false;
  }
}

module.exports.run = async function ({ api, event, args }) {
  const gptEnabled = isGptEnabled();

  if (gptEnabled) {
    const { messageID, threadID, senderID, body } = event;
    const content = encodeURIComponent(body);

    try {
      const res = await axios.get(`https://jonellccprojectapis10.adaptable.app/api/gptconvo?ask=${content}&id=${senderID}`);
      const respond = res.data.response;

      if (res.data.error) {
        api.sendMessage(`Error: ${res.data.error}`, threadID, messageID);
      } else {
        api.sendMessage(`${respond}`, threadID, messageID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while fetching the data.", threadID, messageID);
    }
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const gptEnabled = isGptEnabled();
  const { threadID, messageID, body } = event;

  if (!body.toLowerCase().startsWith("ai")) {
    if (gptEnabled && body.endsWith("?")) {
      return this.run({ api, event, args: [body] });
    }
  }
};

module.exports.turnGptOn = async function (api, threadID) {
  fs.writeFileSync('gpt.txt', 'on', 'utf8');
  const msg = await api.sendMessage("Auto GPT is On. It will respond to every text ending with a question mark.", threadID);
  setTimeout(() => {
    api.unsendMessage(msg.messageID);
  }, 10000);
};

module.exports.turnGptOff = async function (api, threadID) {
  fs.writeFileSync('gpt.txt', 'off', 'utf8');
  const msg = await api.sendMessage("Auto GPT is Off. It will not respond to messages ending with a question mark.", threadID);
  setTimeout(() => {
    api.unsendMessage(msg.messageID);
  }, 10000);
};
