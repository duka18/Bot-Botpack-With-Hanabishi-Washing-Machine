const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const cooldownsFilePath = path.join(__dirname, 'cooldowns.json');

let cooldownsData = {};
if (fs.existsSync(cooldownsFilePath)) {
    const rawCooldownsData = fs.readFileSync(cooldownsFilePath);
    cooldownsData = JSON.parse(rawCooldownsData);
}

async function getYoutubeTitle(link) {
    try {
        const response = await axios.get(`https://joncll.serv00.net/yt.php?url=${encodeURIComponent(link)}`);
        return response.data.title || 'No Title Found';
    } catch (error) {
        console.error('Error fetching YouTube video title:', error);
        throw error;
    }
}

function saveCooldownsData() {
    fs.writeFileSync(cooldownsFilePath, JSON.stringify(cooldownsData, null, 2));
}

 const urlGdpsFilePath = path.join(__dirname, 'gdps', 'urlgdps.json');
let urlGdpsData = {};

if (fs.existsSync(urlGdpsFilePath)) {
    const rawData = fs.readFileSync(urlGdpsFilePath);
    urlGdpsData = JSON.parse(rawData);
}


module.exports.config = {
    name: "addsong",
    version: "1.0.0",
    hasPermission: 0,
    description: "Add song to GDPS using Dropbox, YouTube, or TikTok",
    usePrefix: true,
    credits: "Jonell Magallanes",
    usages: "<dropbox link> | <name of song> or <youtube link> or <tiktok link>",
    cooldowns: 6,
    commandCategory: "GDPS",
};

module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
    const { threadID, messageID, senderID } = event;
    const userResponse = event.body.trim().toLowerCase();
    const initiatorID = handleReply.initiatorID;

    if (senderID !== initiatorID) {
        const initiatorName = (await Users.getNameUser(initiatorID)) || initiatorID;
        const unauthorizedMessage = await api.sendMessage(`You're not authorized to confirm this command. Only ${initiatorName} can confirm.`, threadID, messageID);

        setTimeout(() => {
            api.unsendMessage(unauthorizedMessage.messageID);
        }, 20000);
        return;
    }

    if (userResponse === 'yes') {
        const { dropboxLink, songName, gdpsUrl, gdpsName, youtubeLink, tiktokLink } = handleReply;
        const waitMessage = await api.sendMessage("☁️ | Processing the link, please wait...", threadID, messageID);

        try {
            let finalDropboxLink = dropboxLink;
            let finalSongName = songName;

            if (youtubeLink) {
                finalSongName = await getYoutubeTitle(youtubeLink);

                const response = await axios.get(`http://fr-02.xeh.sh:25097/api/uploadsong?url=${encodeURIComponent(youtubeLink)}`);
                const fileUrl = response.data.transferResponse.downloads.file;
                finalDropboxLink = `https://joncll.serv00.net${fileUrl}`;

                await api.editMessage("☁️ | Reuploading the song, please wait...", waitMessage.messageID);
            }

            if (tiktokLink) {
                const tiktokResponse = await axios.get(`http://fr-02.xeh.sh:25097/api/download?url=${encodeURIComponent(tiktokLink)}`);
                const fileUrl = tiktokResponse.data.transferResponse.downloads.file;
                finalDropboxLink = `https://fgdpscc.ps.fhgdps.com${fileUrl}`;

                const response = await axios.post('https://www.tikwm.com/api/', { url: tiktokLink });
                const data = response.data.data;
                finalSongName = data.title.replace(/[^a-zA-Z0-9]/g, '_');
            }

            const reuploadUrl = `${gdpsUrl}/dashboard/api/addSong.php?download=${encodeURIComponent(finalDropboxLink)}&author=GDPHMUSICBOT&name=${encodeURIComponent(finalSongName)}`;
            const reuploadResponse = await axios.get(reuploadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

            if (reuploadResponse.data.success) {
                const { ID, name, size, newgrounds, customSong } = reuploadResponse.data.song;
                const message = `𝗦𝗼𝗻𝗴 𝗥𝗲𝘂𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝘁𝗼 ${gdpsName}\n━━━━━━━━━━━━━━━━━━\nSong ID: ${ID}\nName: ${name}\nSize: ${size} MB\nNewgrounds: ${newgrounds}\nCustom Song: ${customSong}`;
                await api.editMessage(message, waitMessage.messageID, threadID);
            } else if (reuploadResponse.data.error === 3) {
                await api.editMessage("❌ | This song was already reuploaded.", waitMessage.messageID, threadID);
            } else {
                const errorMessage = reuploadResponse.data.message || "Reupload failed.";
                await api.editMessage(`❌ | ${errorMessage}`, waitMessage.messageID, threadID);
            }

            const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
            if (index !== -1) {
                global.client.handleReply.splice(index, 1);
            }

        } catch (error) {
            await api.editMessage(`❌ | An error occurred: ${error.message}`, waitMessage.messageID, threadID);
        }
    } else if (userResponse === 'cancel') {
        await api.sendMessage("❌ | Addsong has been Cancelled", threadID, messageID);

        const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
        if (index !== -1) {
            global.client.handleReply.splice(index, 1);
        }
    } else {
        await api.sendMessage("❌ | Invalid response. Please reply 'yes' to confirm or 'cancel' to cancel the command.", threadID, messageID);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (!urlGdpsData.hasOwnProperty(threadID)) {
        return api.sendMessage("❌ | This group chat is not registered. Please register a GDPS URL first using !gdpsreg <URL GDPS> | <GDPS name>.", threadID, messageID);
    }

    // Check cooldown for the user
    const currentTime = Date.now();
    const userCooldowns = cooldownsData[senderID] || [];

    const recentCooldowns = userCooldowns.filter(timestamp => currentTime - timestamp < 4 * 60 * 60 * 1000);

    if (recentCooldowns.length >= 5) {
        return api.sendMessage("❌ | You have reached the limit of 5 commands in 4 hours. Please wait to use this command again.", threadID, messageID);
    }

    // Update cooldowns
    recentCooldowns.push(currentTime);
    cooldownsData[senderID] = recentCooldowns;
    saveCooldownsData();

    const { url: gdpsUrl, name: gdpsName } = urlGdpsData[threadID];
    const input = args.join(" ").trim();
    const [link, songName] = input.split("|").map(item => item.trim());

    const dropboxRegex = /^(https?:\/\/)?(www\.)?dropbox\.com\/[^\s]+$/;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/;
    const tiktokRegex = /^(https?:\/\/)?(www\.tiktok\.com\/|vm\.tiktok\.com\/|vt\.tiktok\.com\/)[^\s]+$/;

    if (!link) {
        return api.sendMessage("❌ | Please provide a valid link.\n\nUsage: !addsong <Dropbox link> | <Name of song> or <YouTube link> or <TikTok link>", threadID, messageID);
    }

    if (dropboxRegex.test(link)) {
        confirmAndHandleSong(api, threadID, messageID, link, songName, gdpsUrl, gdpsName, senderID);
    } else if (youtubeRegex.test(link)) {
        confirmAndHandleSong(api, threadID, messageID, null, songName, gdpsUrl, gdpsName, senderID, link);
    } else if (tiktokRegex.test(link)) {
        confirmAndHandleSong(api, threadID, messageID, null, songName, gdpsUrl, gdpsName, senderID, null, link);
    } else {
        return api.sendMessage("❌ | Please provide a valid Dropbox, YouTube, or TikTok link.\n\nUsage: !addsong <Dropbox link> | <Name of song> or <YouTube link> or <TikTok link>", threadID, messageID);
    }
};

async function confirmAndHandleSong(api, threadID, messageID, dropboxLink, songName, gdpsUrl, gdpsName, senderID, youtubeLink = null, tiktokLink = null) {
    api.sendMessage("⚠️ 𝗔𝗱𝗱𝘀𝗼𝗻𝗴 𝗖𝗼𝗻𝗳𝗶𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n━━━━━━━━━━━━━━━━━━\nAre you sure you want to add this song? Reply 'yes' to confirm or 'cancel' to cancel the command.", threadID, (err, info) => {
        if (err) return console.error('Error sending confirmation message:', err);

        global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            dropboxLink,
            songName,
            gdpsUrl,
            gdpsName,
            initiatorID: senderID,
            youtubeLink,
            tiktokLink
        });
    });
}
