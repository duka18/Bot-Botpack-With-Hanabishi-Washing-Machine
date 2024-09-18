module.exports.config = {
    name: "apitest",
    version: "1.0.0",
    hasPermission: 0,
    description: "Api Tester",
    usePrefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 6,
    commandCategory: "Utility",
};

module.exports.run = async function ({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage("Please provide a URL.", event.threadID);
    }

    const urlapi = args.join(" ");

    try {
       const lod = await api.sendMessage("Parsing...", event.threadID, event.messageID);

        const response = await fetch(urlapi);
        const data = await response.json();

        let message = "";
        if (data.response) {
            message = `Response: ${data.response}`;
        } else if (data.data) {
            message = `Data: ${data.data}`;
        } else if (Array.isArray(data)) {
            message = `Array Response: ${JSON.stringify(data)}`;
        } else {
            message = `Unknown Response Structure: ${JSON.stringify(data)}`;
        }
        
        api.editMessage(message, lod.messageID, event.threadID, event.messageID);
    } catch (error) {
        api.editMessage(error.message, lod.messageID, event.threadID, event.messageID);
    }
};
