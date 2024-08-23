const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports.config = {
    name: "lyrics",
    version: "1.0",
    hasPermission: 0,
    description: "Get lyrics and artist image",
    credits: "Jonell Magallanes",
    usePrefix: true,
    commandCategory: "Search",
    usages: "[song title]",
    cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const title = args.join(" ");

        if (!title) {
            return api.sendMessage(
                "⛔ Invalid Usage\n━━━━━━━━━━━━━━━\n\nPlease provide a song title to search for lyrics.",
                event.threadID,
                event.messageID
            );
        }
api.sendMessage("🔎 Searching for lyrics", event.threadID, event.messageID);
        const apiUrl = `https://aemt.me/lirik?text=${encodeURIComponent(title)}`;
        console.log(`Fetching data from API: ${apiUrl}`);

        const res = await axios.get(apiUrl);
        const data = res.data.result;

        if (!data || !data.lyrics) {
            return api.sendMessage(
                `No lyrics found for "${title}". Please try with a different song.`,
                event.threadID,
                event.messageID
            );
        }

        const artistImageResponse = await axios.get(data.artistImage, { responseType: "arraybuffer" });
        const imageFileName = `${data.title.replace(/\s/g, "_").toLowerCase()}_image.jpg`;
        const imagePath = path.join(__dirname, "images", imageFileName);
        await fs.outputFile(imagePath, artistImageResponse.data);

        const message = `🎵 Lyrics for "${data.title}" by ${data.artist}\n━━━━━━━━━━━━━━━\n\n${data.lyrics}`;

        const imgData = fs.createReadStream(imagePath);

        await api.sendMessage({
            body: message,
            attachment: imgData,
        }, event.threadID);

        console.log(`Lyrics and image successfully sent for "${data.title}"`);

        await fs.remove(imagePath);
        console.log(`Image file ${imagePath} removed.`);

    } catch (error) {
        console.error("Error fetching lyrics:", error);
        return api.sendMessage(
            "An error occurred while fetching lyrics. Please try again later.",
            event.threadID,
            event.messageID
        );
    }
};
