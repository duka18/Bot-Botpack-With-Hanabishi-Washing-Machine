const { google } = require('googleapis');
const fs = require('fs');
const PATH = require('path');
const mime = require('mime-types');
const axios = require('axios');

module.exports.config = {
  name: "adownv2",
  version: "1.0",
  hasPermssion: 0,
  credits: "Jonell Magallanes",
  description: "Automatically download files from Google Drive and YouTube",
  usePrefix: false,
  hide: true,
  commandCategory: "Media",
  usage: " ",
  cooldowns: 3,
  apiKey: 'AIzaSyCYUPzrExoT9f9TsNj7Jqks1ZDJqqthuiI',
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, body, messageID } = event;

  if (!module.exports.config.apiKey) {
    console.error('No Google Drive API key provided in the module config.');
    return;
  }

  const drive = google.drive({ version: 'v3', auth: module.exports.config.apiKey });

  const gdriveLinkPattern = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:folderview\?id=|file\/d\/|open\?id=))([\w-]{33}|\w{19})(&usp=sharing)?/gi;
  let match;

  while ((match = gdriveLinkPattern.exec(body)) !== null) {
    const fileId = match[1];

    try {
      const res = await drive.files.get({ fileId: fileId, fields: 'name, mimeType' });
      const fileName = res.data.name;
      const mimeType = res.data.mimeType;

      const extension = mime.extension(mimeType);
      const destFilename = `${fileName}${extension ? '.' + extension : ''}`;
      const destPath = PATH.join(__dirname, destFilename);

      console.log(`Downloading file "${fileName}"...`);
      api.setMessageReaction("⤵️", messageID, () => {}, true);

      const dest = fs.createWriteStream(destPath);
      let progress = 0;

      const resMedia = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      resMedia.data
        .on('end', () => {
          console.log(`Downloaded file "${fileName}"`);
          api.sendMessage({ body: `==AUTO DOWN GOOGLE DRIVE==\n\nFileName: ${fileName}`, attachment: fs.createReadStream(destPath) }, threadID, () => {
            fs.unlink(destPath, (err) => {
              if (err) console.error(err);
              else console.log(`Deleted file "${fileName}"`);
            });
          });
        })
        .on('error', err => {
          console.error('Error downloading file:', err);
        })
        .on('data', d => {
          progress += d.length;
          process.stdout.write(`Downloaded ${progress} bytes\r`);
          api.setMessageReaction("✅", messageID, () => {}, true);
        })
        .pipe(dest);
    } catch (err) {
      console.error('The API returned an error: ', err);
    }
  }

  const youtubeLinkPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/gi;

  while ((match = youtubeLinkPattern.exec(body)) !== null) {
    const yt = match[0];
    try {
      const response = await axios.get(`https://joncll.serv00.net/videodl.php?url=${yt}`);
      const { video } = response.data;

      const videoStream = (await axios.get(video, { responseType: 'stream' })).data;
      const videoName = response.data.title.replace(/[\/\\:*\?"<>|]/g, '_');
      const videoPath = PATH.join(__dirname, `${videoName}.mp4`);

      console.log(`Downloading YouTube video "${videoName}"...`);
      api.setMessageReaction("⤵️", messageID, () => {}, true);

      const dest = fs.createWriteStream(videoPath);
      let progress = 0;

      videoStream
        .on('end', () => {
          console.log(`Downloaded video "${videoName}"`);
          api.sendMessage({ body: `==AUTO DOWN YOUTUBE==\n\nVideoName: ${videoName}`, attachment: fs.createReadStream(videoPath) }, threadID, () => {
            fs.unlink(videoPath, (err) => {
              if (err) console.error(err);
              else console.log(`Deleted video "${videoName}"`);
            });
          });
        })
        .on('error', err => {
          console.error('Error downloading video:', err);
        })
        .on('data', d => {
          progress += d.length;
          process.stdout.write(`Downloaded ${progress} bytes\r`);
          api.setMessageReaction("✅", messageID, () => {}, true);
        })
        .pipe(dest);
    } catch (err) {
      console.error('The API returned an error: ', err);
    }
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage("📝 | This command automatically downloads TikTok, Facebook, and Capcut videos by Jonell Magallanes", event.threadID);
};
