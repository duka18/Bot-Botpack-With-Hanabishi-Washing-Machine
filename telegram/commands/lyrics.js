const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = (bot) => ({
  name: "lyrics",
  desc: "Get lyrics and artist image",
  credit: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 0,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
      const args = text.split(" ").slice(1);
      const title = args.join(" ");

      if (!title) {
        return bot.sendMessage(chatId, "⛔ Invalid Usage\n━━━━━━━━━━━━━━━\n\nPlease provide a song title to search for lyrics.");
      }

      await bot.sendMessage(chatId, "🔎 Searching for lyrics...");

      const apiUrl = `https://aemt.me/lirik?text=${encodeURIComponent(title)}`;
      console.log(`Fetching data from API: ${apiUrl}`);

      const res = await axios.get(apiUrl);
      const data = res.data.result;

      if (!data || !data.lyrics) {
        return bot.sendMessage(chatId, `No lyrics found for "${title}". Please try with a different song.`);
      }

      const artistImageResponse = await axios.get(data.artistImage, { responseType: "arraybuffer" });
      const imageFileName = `${data.title.replace(/\s/g, "_").toLowerCase()}_image.jpg`;
      const imagePath = path.join(__dirname, "images", imageFileName);
      await fs.outputFile(imagePath, artistImageResponse.data);

      const message = `🎵 Lyrics for "${data.title}" by ${data.artist}\n━━━━━━━━━━━━━━━\n\n${data.lyrics}`;

      const imgData = fs.createReadStream(imagePath);

      await bot.sendPhoto(chatId, imgData, { caption: message });

      console.log(`Lyrics and image successfully sent for "${data.title}"`);

      await fs.remove(imagePath);
      console.log(`Image file ${imagePath} removed.`);

    } catch (error) {
      console.error("Error fetching lyrics:", error);
      bot.sendMessage(chatId, "An error occurred while fetching lyrics. Please try again later.");
    }
  }
});
