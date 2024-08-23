
module.exports.config = {
  name: "prefix",
    version: "1.0.1",
  hasPermssion: 0,
  credits: "Jonell Magallanes", 
  description: "no prefix",
  hide: true,
  usePrefix: true,
  commandCategory: "No command marks needed",
  usages: "...",
    cooldowns: 1, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
  var { threadID, messageID } = event;
  if (event.body.indexOf("prefix")==0 || (event.body.indexOf("Prefix")==0 || (event.body.indexOf("Ano prefix")==0 || (event.body.indexOf("ano prefix")==0)))) {
    const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Manila").format("HH:mm:ss || D/MM/YYYY");
      api.shareContact(`My Current System Prefix is > ${global.config.PREFIX} <\nType ${global.config.PREFIX}help to see all commands\nTime: ${gio}`, api.getCurrentUserID(), event.threadID);
    }
  }
  module.exports.run = function({ api, event, client, __GLOBAL }) {

      }