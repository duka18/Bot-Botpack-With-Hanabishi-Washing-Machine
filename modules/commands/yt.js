const ytdl = require('ytdl-core');
const simpleytapi = require('simple-youtube-api');
const path = require('path');
const fs = require('fs');



module.exports.config = {
    name: "yt",
    hasPermssion: 0,
    version: "1.0.1",
    credits: "Jonell Magallanes",
    usePrefix: true,
    description: "Search and send YouTube video",
    commandCategory: "video",
    cooldowns: 40
};

module.exports.run = async function ({ event, api, args }) {
    const youtube = new simpleytapi('AIzaSyCMWAbuVEw0H26r94BhyFU4mTaP5oUGWRw');

    const tid = event.threadID;
    const userId = event.senderID;

    const searchString = args.join(' ');
    if (!searchString) return api.sendMessage("📝 | Please Enter Your Search Query to Youtube Command", tid);
  const search = await api.sendMessage(`🔎 Finding video of > ${searchString} <`)
    try {
        const videos = await youtube.searchVideos(searchString, 1);
        console.log(`Downloading Video: ${videos[0].title}`);
        const url = `https://www.youtube.com/watch?v=${videos[0].id}`;

        const videoInfo = await ytdl.getInfo(url);
        const videoTitle = videoInfo.videoDetails.title;
        const file = path.resolve(__dirname, 'cache', `video.mp4`);
        console.log(`Downloaded Complete Ready to send The user`);

        const videoStream = ytdl(url, { filter: 'videoandaudio' });
        const writeStream = fs.createWriteStream(file);

        videoStream.pipe(writeStream);

        videoStream.on('progress', (chunkLength, downloaded, total) => {
            const progress = (downloaded / total) * 100;
            console.log(`Progress: ${progress.toFixed(2)}%`);
            if (total > 25 * 1024 * 1024) {
                videoStream.destroy();
                writeStream.close();
                fs.unlinkSync(file);
                api.sendMessage("[ ERROR ] This Youtube Video you requested has 25Mb reach limit can't send it", tid);
            }
        });

        writeStream.on('finish', () => {
            if (fs.existsSync(file)) {
                api.sendMessage({
                    body: `𝗬𝗼𝘂𝘁𝘂𝗯𝗲 𝗣𝗹𝗮𝘆𝗲𝗿\n━━━━━━━━━━━━━━━━━━\nHere's the YouTube video you requested\nURL: ${url}\n\nTitle: ${videoTitle}`,
                    attachment: fs.createReadStream(file)
                }, tid);
            }
        });
    } catch (error) {
        api.sendMessage("🚨 | An error occurred while searching for the YouTube video.", tid);
    }
};
