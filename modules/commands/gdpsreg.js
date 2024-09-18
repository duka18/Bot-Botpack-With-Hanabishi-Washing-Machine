const fs = require('fs');
const axios = require('axios');

const urlGdpsFilePath = './modules/commands/gdps/urlgdps.json';
let urlGdpsData = {};

if (fs.existsSync(urlGdpsFilePath)) {
    const rawData = fs.readFileSync(urlGdpsFilePath);
    urlGdpsData = JSON.parse(rawData);
} else {
    fs.writeFileSync(urlGdpsFilePath, JSON.stringify({}));
}

function saveUrlGdpsData(data) {
    fs.writeFileSync(urlGdpsFilePath, JSON.stringify(data, null, 2));
}

function isValidURL(string) {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(string);
}

async function checkUrlStatus(url) {
    try {
        const response = await axios.get(`${url}/dashboard`);
        return response.status === 200;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return '404';
        }
        return false;
    }
}

module.exports.config = {
    name: "gdpsreg",
    version: "1.0.0",
    hasPermission: 0,
    description: "Register a GDPS",
    credits: "Jonell Magallanes",
    usePrefix: true,
    cooldowns: 10,
    commandCategory: "GDPS",
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (args.length === 0) {
        return api.sendMessage(`❌ | Please provide a GDPS URL and name to register.\n\nUsage: ${adminConfig.prefix}gdpsreg <URL> | <GDPS name>`, threadID, messageID);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const userIsAdmin = threadInfo.adminIDs.some(idInfo => idInfo.id === senderID);

    if (!userIsAdmin) {
        return api.sendMessage("🛡️ | You're not able to use GDPS registration commands because you are not an admin in this group chat.", threadID, messageID);
    }

    const commandArgs = args.join(" ").split("|").map(arg => arg.trim());

    if (commandArgs.length !== 2) {
        return api.sendMessage(`❌ | Please provide both a GDPS URL and a GDPS name.\n\nUsage: ${adminConfig.prefix}gdpsreg <URL> | <GDPS name>`, threadID, messageID);
    }

    const [url, name] = commandArgs;

    if (!isValidURL(url)) {
        return api.sendMessage("❌ | The provided URL is not valid. Please provide a valid URL.", threadID, messageID);
    }

    const isUrlValid = await checkUrlStatus(url);
    if (isUrlValid === '404') {
        return api.sendMessage("❌ | This link is not a valid GDPS URL. Please correct your URL GDPS only.", threadID, messageID);
    } else if (!isUrlValid) {
        return api.sendMessage("❌ | The provided GDPS URL is not accessible. Please provide a valid URL.", threadID, messageID);
    }

    if (urlGdpsData[threadID]) {
        if (urlGdpsData[threadID].url === url) {
            return api.sendMessage("❌ | This GDPS URL is already registered for this thread.", threadID, messageID);
        }
        if (urlGdpsData[threadID].name === name) {
            return api.sendMessage("❌ | This GDPS name is already registered for this thread.", threadID, messageID);
        }
    }

    urlGdpsData[threadID] = { url, name };

    const data = { threadID };
    fs.writeFile('./threadID.json', JSON.stringify(data), (err) => {
        if (err) {
            console.error("Failed to save threadID:", err);
            return;
        }
        console.log("ThreadID saved to threadID.json");

        saveUrlGdpsData(urlGdpsData);

        api.sendMessage(`✅ | Successfully registered GDPS URL and name for this thread.\n\nURL: ${url}\nName: ${name}`, threadID, () => {
            api.sendMessage("🔃 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗣𝗿𝗼𝗰𝗲𝘀𝘀\n━━━━━━━━━━━━━━━━━━\nPlease give me a few seconds.", threadID);

            setTimeout(() => {
                process.exit(1);
            }, 4000);
        });
    });
};
