const os = require('os');

module.exports.config = {
    name: "ping",
    version: "1.0.0",
    hasPermission: 2,
    description: "Respond with latency and real-time system information",
    usePrefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 6,
    commandCategory: "System",
};

module.exports.run = async function ({ api, event }) {
    const start = Date.now();
    
    api.sendMessage("Pong!", event.threadID, (err, messageInfo) => {
        if (err) return console.error(err);

        const botResponseTime = Date.now() - start;

        setTimeout(() => {
            api.unsendMessage(messageInfo.messageID);
        }, 1000);

        const serverLatency = Date.now() - start;

        const osUptime = os.uptime();
        const osPlatform = os.platform();
        const osArch = os.arch();

        api.sendMessage(`🤖 Bot Response: ${botResponseTime}ms\n🌐 Server Latency: ${serverLatency}ms\n⏱️ OS Uptime: ${osUptime}s\n📝 Platform: ${osPlatform}\n⚙️ Architecture: ${osArch}`, event.threadID, event.messageID);
    });
};
