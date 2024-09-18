module.exports.config = {
    name: "msai",
    version: "1.0.0",
    hasPermission: 0,
    description: "AI chat using MSIAI",
    usePrefix: false,
    credits: "Jonell Magallanes",
    cooldowns: 10,
    commandCategory: "AI",
};

module.exports.run = async function ({ api, event, args }) {
    const MSIAI = require('msiai');
    const msiai = new MSIAI();
    const tid = event.threadID;
    const mid = event.messageID;
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a question\n\nExample: msai what is programming?", tid, mid); 

    const fet = await api.sendMessage("Typing......", tid, mid);

    msiai.chat({
        model: "gpt-4o-mini",
        prompt: prompt,
        system: "You are an AI Assistant Like GPT4.",
        online: true
    }).then(response => {
        api.editMessage(response.reply, fet.messageID, tid, mid);
    }).catch(error => {
        api.editMessage(error.message, fet.messageID, tid, mid);
    });
};
