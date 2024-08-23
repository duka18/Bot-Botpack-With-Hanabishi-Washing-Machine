const axios = require('axios');

module.exports.config = {
    name: "regco",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "Recognize music",
    usePrefix: true,
    commandCategory: "Tool",
    usages: "Utility",
    cooldowns: 5,
};

module.exports.languages = {
    "vi": {
        "invalidFormat": "❌ Tin nhắn bạn phản hồi phải là một audio, video, ảnh nào đó"
    },
    "en": {
        "invalidFormat": "❌ You need to reply to a message containing audio, video, or picture"
    }
}

module.exports.run = async ({ api, event, getText }) => {
    if (event.type !== "message_reply") return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
    if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
    if (event.messageReply.attachments.length > 1) return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
    
    const pro = await api.sendMessage("Uploading Attachment URL.....", event.threadID, event.messageID);
    const attachmentUrl = event.messageReply.attachments[0].url;

    const apiUrl = `http://130.250.191.69:8222/regco?path=${attachmentUrl}`;
    const config = {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    const retryLimit = 4;
    let attempt = 0;
    let responseData = null;

    const retryMessages = [
        "Retrying to recognize the music...",
        "Still trying to recognize the music...",
        "Last attempt to recognize the music...",
        "Final retry to recognize the music..."
    ];

    while (attempt < retryLimit) {
        try {
            if (attempt > 0) {
                api.editMessage(retryMessages[attempt - 1], pro.messageID, event.threadID, event.messageID);
            } else {
                api.editMessage("Recognizing music......", pro.messageID, event.threadID, event.messageID);
            }
            
            const response = await axios.get(apiUrl, config);
            responseData = response.data;

            const artist = responseData.result?.artist;
            if (artist === "Unknown" || !artist) {
                attempt++;
                if (attempt >= retryLimit) {
                    throw new Error('Failed to recognize music after multiple attempts.');
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }

            break;
        } catch (error) {
            console.error('Error sending request to external API:', error);
            if (attempt >= retryLimit - 1) {
                return api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
            }
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    const artist = responseData.result?.artist || "Unknown";
    const title = responseData.result?.title || "Unknown";
    const album = responseData.result?.album || "Unknown";
    const release_date = responseData.result?.release_date || "Unknown";
    const label = responseData.result?.label || "Unknown";
    const timecode = responseData.result?.timecode || "Unknown";
    const song_link = responseData.result?.song_link || "Unknown";

    api.editMessage("Completed.", pro.messageID, event.threadID, event.messageID);
    api.unsendMessage(pro.messageID);
    return api.sendMessage(`🎵 𝗠𝘂𝘀𝗶𝗰 𝗥𝗲𝗰𝗼𝗴𝗻𝗶𝘁𝗶𝗼𝗻 𝗥𝗲𝘀𝘂𝗹𝘁\n━━━━━━━━━━━━━━━━━━\nArtist: ${artist}\nTitle: ${title}\nAlbum: ${album}\nRelease Date: ${release_date}\nLabel: ${label}\nTimecode: ${timecode}\nSong Link: ${song_link}`, event.threadID, event.messageID);
}
