const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports = (bot) => ({
  name: "image",
  desc: "Finding Image from Pinterest",
  credit: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 0,

  execute: async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const args = text.substring(text.indexOf(' ') + 1).split(" ");

    try {
      const keySearch = args.join(" ");

      if (!keySearch.includes("-")) {
        return bot.sendMessage(chatId, "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗲\n━━━━━━━━━━━━━━━\n\nPlease enter the search query and number of images (1-99). Example: tomozaki -5");
      }

      bot.sendMessage(chatId, "Please wait...");

      const keySearchs = keySearch.substr(0, keySearch.indexOf('-')).trim();
      let numberSearch = parseInt(keySearch.split("-").pop().trim()) || 10;

      if (isNaN(numberSearch) || numberSearch < 1 || numberSearch > 10) {
        return bot.sendMessage(chatId, "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗡𝘂𝗺𝗯𝗲𝗿\n━━━━━━━━━━━━━━━\n\nPlease enter a valid number of images (1-99). Example: wallpaper -5");
      }

      const apiUrl = `https://jonellccprojectapis10.adaptable.app/api/pin?title=wallpaper&count=${numberSearch}`;
      console.log(`Fetching data from API: ${apiUrl}`);

      const res = await axios.get(apiUrl);
      const data = res.data.data;

      if (!data || data.length === 0) {
        return bot.sendMessage(chatId, `No results found for your query "${keySearchs}". Please try with a different query.`);
      }

      const mediaData = [];

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        console.log(`Fetching image ${i + 1} from URL: ${data[i]}`);
        mediaData.push({ type: 'photo', media: data[i] });
      }

      await bot.sendMediaGroup(chatId, mediaData);
      bot.sendMessage(chatId, `📸 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁\n━━━━━━━━━━━━━━━\nHere are the top ${numberSearch} results for your query "${keySearchs}"`);

      console.log(`Images successfully sent to chat ${chatId}`);

    } catch (error) {
      console.error("Error fetching images from Pinterest:", error);
      return bot.sendMessage(chatId, "An error occurred while fetching images. Please try again later.");
    }
  }
});
