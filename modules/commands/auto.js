const axios = require('axios');
const fs = require('fs');
const getFBInfo = require("@xaviabot/fb-downloader");
const line = "━━━━━━━━━━━━━━━━━━";
module.exports.config = {
  name: "adown",
  version: "1.0",
  hasPermssion: 0,
  credits: "Jonell Magallanes",
  description: "Automatically download TikTok, Facebook, and Capcut videos by Jonell Magallanes",
  usePrefix: false,
  hide: true,
  commandCategory: "Media",
  usage: " ",
  cooldowns: 3,
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.body && event.isGroup) {
    const tiktokLinkRegex = /https:\/\/(www\.|vt\.|vm\.)?tiktok\.com\/.*$/;
    const facebookLinkRegex = /https:\/\/(www\.)?facebook\.com\/.*$/;
    const capcutLinkRegex = /https:\/\/(www\.)?capcut\.com\/t\/.*$/;
    const link = event.body;

    if (tiktokLinkRegex.test(link)) {
      api.setMessageReaction("📥", event.messageID, () => {}, true);
      downloadAndSendTikTokContent(link, api, event);
    } else if (facebookLinkRegex.test(link)) {
      api.setMessageReaction("📥", event.messageID, () => {}, true);
      downloadAndSendFBContent(link, api, event);
    } else if (capcutLinkRegex.test(link)) {
      api.setMessageReaction("📥", event.messageID, () => {}, true);
      downloadAndSendCapcutContent(link, api, event);
    }
  }
};

const downloadAndSendTikTokContent = async (url, api, event) => {
  try {
    const response = await axios.post('https://www.tikwm.com/api/', { url });
    const data = response.data.data;
    const videoStream = await axios({
      method: 'get',
      url: data.play,
      responseType: 'stream'
    }).then(res => res.data);

    const fileName = `TikTok-${Date.now()}.mp4`;
    const filePath = `./${fileName}`;
    const videoFile = fs.createWriteStream(filePath);

    videoStream.pipe(videoFile);

    videoFile.on('finish', () => {
      videoFile.close(() => {
        console.log('Downloaded TikTok video file.');
        api.sendMessage({
          body: `𝗧𝗶𝗸𝘁𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n${line}\nContent: ${data.title}\nLikes: ${data.digg_count}\nComments: ${data.comment_count}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
          fs.unlinkSync(filePath);
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
};

const downloadAndSendFBContent = async (url, api, event) => {
  const fbvid = './video.mp4'; 
  try {
    const result = await getFBInfo(url);
    let videoData = await axios.get(encodeURI(result.sd), { responseType: 'arraybuffer' });
    fs.writeFileSync(fbvid, Buffer.from(videoData.data, "utf-8"));

    api.sendMessage({
      body: `𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n${line}`,
      attachment: fs.createReadStream(fbvid)
    }, event.threadID, () => {
      fs.unlinkSync(fbvid); 
    });
  } catch (e) {
    console.error(e);
  }
};

const downloadAndSendCapcutContent = async (url, api, event) => {
  try {
    const response = await axios.get(`https://ccexplorerapisjonell.vercel.app/api/capcut?url=${url}`);
    const { result } = response.data;

    const capcutFileName = `Capcut-${Date.now()}.mp4`;
    const capcutFilePath = `./${capcutFileName}`;

    const videoResponse = await axios({
      method: 'get',
      url: result.video_ori,
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(capcutFilePath, Buffer.from(videoResponse.data, 'binary'));

    api.sendMessage({
      body: `𝗖𝗮𝗽𝗰𝘂𝘁 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n${line}\n𝗧𝗶𝘁𝗹𝗲: ${result.title}\n𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗇: ${result.description}`,
      attachment: fs.createReadStream(capcutFilePath)
    }, event.threadID, () => {
      fs.unlinkSync(capcutFilePath);
    });
  } catch (e) {
    console.error(e);
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage("📝 | This command automatically downloads TikTok, Facebook, and Capcut videos by Jonell Magallanes", event.threadID);
};
