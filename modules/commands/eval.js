module.exports.config = {
    name: "eval",
    version: "1.0.0",
    hasPermssion: 2,
    description: "Evaluate JavaScript code",
    usePrefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 3,
    commandCategory: "Utility",
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const code = args.join(" ");

    if (!code) {
        return api.sendMessage("Please provide JavaScript code to evaluate.", threadID, messageID);
    }

    try {
        let result = await eval(code);

        if (typeof result !== 'string') {
            result = require('util').inspect(result, { depth: 0 });
        }

        api.sendMessage(`✏️ 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗥𝗲𝘀𝘂𝗹𝘁\n━━━━━━━━━━━━━━━━━━\n${result}`, threadID, messageID);
    } catch (error) {
        api.sendMessage(`🔴 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗘𝗿𝗿𝗼𝗿\n━━━━━━━━━━━━━━━━━━\n${error.message}`, threadID, messageID);
    }
};
