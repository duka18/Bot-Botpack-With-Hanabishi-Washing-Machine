const axios = require('axios');
const fs = require('fs');
const path = require('path');

const urlGdpsFilePath = path.join(__dirname, 'gdps', 'urlgdps.json');
let urlGdpsData = {};

if (fs.existsSync(urlGdpsFilePath)) {
    const rawData = fs.readFileSync(urlGdpsFilePath);
    urlGdpsData = JSON.parse(rawData);
}

module.exports.config  = {
    name: "profile",
    version: "1.0.0",
    hasPermission: 0,
    description: "Get user gdps information",
    usePrefix: true,
    cooldowns: 20,
    commandCategory: "GDPS",
};
    module.exports.run = async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const username = encodeURIComponent(args[0]);

        if (!username) return api.sendMessage("Please provide a username.", threadID, messageID);

        try {
            if (!urlGdpsData.hasOwnProperty(threadID)) {
                return api.sendMessage("❌ | This group chat is not registered. Please register a GDPS URL first using !gdpsreg <URL GDPS> | <GDPS name>.", threadID, messageID);
            }

            const { url: gdpsUrl, name: gdpsName } = urlGdpsData[threadID];

            const waitMessage = await api.sendMessage("🔍 | 𝖢𝗁𝖾𝖼𝗄𝗂𝗇𝗀...", threadID, messageID);

            const response = await axios.get(`https://gdpsapibyjonellccprojects.adaptable.app/api/player?user=${username}&link=${gdpsUrl}`);
            const data = response.data;

            if (!data.Name) {
                return api.sendMessage("❌ | The specified user does not exist.", threadID, messageID);
            }

            const formattedResponse = `${gdpsName} 𝖲𝖾𝗋𝗏𝖾𝗋 𝖯𝗅𝖺𝗒𝖾𝗋 𝖲𝗍𝖺𝗍𝗌\n━━━━━━━━━━━━━━━━━━\n
𝖭𝖺𝗆𝖾: ${data.Name}
𝖴𝗌𝖾𝗋 𝖨𝖣: ${data["User ID"]}
𝖠𝖼𝖢𝗈𝗎𝗇𝗍 𝖨𝖣: ${data["Account ID"]}
𝖲𝗍𝖺𝗋𝗌: ${data.Stars}
𝖢𝗈𝗂𝗇𝗌: ${data.Coins}
𝖴𝗌𝖾𝗋 𝖢𝗈𝗂𝗇𝗌: ${data["User Coins"]}
𝖣𝗂𝖺𝗆𝗈𝗇𝖽𝗌: ${data.Diamonds}
𝖢𝗋𝖾𝖺𝗍𝗈𝗋 𝖯𝗈𝗂𝗇𝗍𝗌: ${data["Creator points"]}
𝖫𝖾𝖺𝖽𝖾𝗋𝖻𝗈𝖺𝗋𝖽𝗌 𝖱𝖺𝗇𝗄: ${data["Leaderboards rank"]}
𝖢𝗋𝖾𝖺𝗍𝗈𝗋 𝖫𝖾𝖺𝖽𝖾𝗋𝖻𝗈𝖺𝗋𝖽𝗌 𝖱𝖺𝗇𝗄: ${data["Creator leaderboards rank"]}
𝖣𝗂𝗌𝖼𝗈𝗋𝖽: ${data.Discord}`;

            await api.editMessage(formattedResponse, waitMessage.messageID, threadID, messageID);
        } catch (error) {
            console.error(error);
            api.editMessage(error.message, waitMessage.messageID, threadID, messageID);
        }
    };
