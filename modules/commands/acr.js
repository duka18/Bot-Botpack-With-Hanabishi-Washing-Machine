const { RentryClient } = require('rentry-pastebin');
const axios = require('axios');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const { join, resolve } = require("path");

const admin = "100036956043695";

module.exports.config = {
  name: "acr",
  version: "1.0.1",
  hasPermission: 0,
  credits: "D-Jukie",
  description: "Apply code from buildtooldev and rentry",
  usePrefix: true,
  hide: true,
  commandCategory: "Admin",
  usages: "[reply or text]",
  cooldowns: 0,
  dependencies: {}
};

module.exports.run = async function({ api, event, args }) {
  const { senderID, threadID, messageID, messageReply, type } = event;

  if (senderID !== admin) {
    return api.sendMessage("Not Authorized to use this command.", threadID, messageID);
  }

  const client = new RentryClient();

  var name = args[0];
  if (type == "message_reply") {
    var text = messageReply.body;
  }
  if (!text && !name) {
    return api.sendMessage('Please reply to the link you want to apply the code to or write the file name to upload the code to rentry!', threadID, messageID);
  }
  if (!text && name) {
    var data = fs.readFileSync(`${__dirname}/${args[0]}.js`, "utf-8");
    try {
      await client.createToken();
      const struct = await client.createPaste({
        content: data,
        customEditCode: "imsostupid"
      });
      const link = `https://rentry.co/${struct.url}`;
      return api.sendMessage(link, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`An error occurred while creating the paste: ${error.message}`, threadID, messageID);
    }
    return;
  }

  var urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  var url = text.match(urlR);
  if (url && url[0].indexOf('rentry') !== -1) {
    try {
      const response = await axios.get(url[0]);
      const data = response.data;
      fs.writeFile(
        `${__dirname}/${args[0]}.js`,
        data,
        "utf-8",
        function(err) {
          if (err) return api.sendMessage(`An error occurred while applying the code ${args[0]}.js`, threadID, messageID);
          api.sendMessage(`Code applied ${args[0]}.js, use command load to use!`, threadID, messageID);
        }
      );
    } catch (error) {
      return api.sendMessage(`An error occurred while fetching the Rentry paste: ${error.message}`, threadID, messageID);
    }
    return;
  }

  if (url && (url[0].indexOf('buildtool') !== -1 || url[0].indexOf('tinyurl.com') !== -1)) {
    const options = {
      method: 'GET',
      url: messageReply.body
    };
    request(options, function(error, response, body) {
      if (error) return api.sendMessage('Please only reply to the link (contains nothing but links)', threadID, messageID);
      const load = cheerio.load(body);
      load('.language-js').each((index, el) => {
        if (index !== 0) return;
        var code = el.children[0].data;
        fs.writeFile(`${__dirname}/${args[0]}.js`, code, "utf-8",
          function(err) {
            if (err) return api.sendMessage(`An error occurred while applying the new code to "${args[0]}.js".`, threadID, messageID);
            return api.sendMessage(`Added this code "${args[0]}.js", use command load to use!`, threadID, messageID);
          }
        );
      });
    });
    return;
  }

  if (url && url[0].indexOf('drive.google') !== -1) {
    var id = url[0].match(/[-\w]{25,}/);
    const path = resolve(__dirname, `${args[0]}.js`);
    try {
      await utils.downloadFile(`https://drive.google.com/u/0/uc?id=${id}&export=download`, path);
      return api.sendMessage(`Added this code "${args[0]}.js" If an error occurs, change the drive file to txt!`, threadID, messageID);
    }
    catch (e) {
      return api.sendMessage(`An error occurred while applying the new code to "${args[0]}.js".`, threadID, messageID);
    }
  }
};
