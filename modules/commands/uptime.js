const os = require('os');
const si = require('systeminformation');

module.exports.config = {
    name: "uptime",
    version: "1.0.0",
    hasPermission: 0,
    description: "Get detailed uptime and system information",
    usePrefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 6,
    commandCategory: "System",
};

module.exports.run = async function ({ api, event }) {
const load = await api.sendMessage("Loading....", event.threadID, event.messageID);
    try {
   
        const uptimeSeconds = os.uptime();
        const uptime = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8);
        const currentDateTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

        const cpu = await si.cpu();
        const memory = await si.mem();
        const disk = await si.fsSize();

        const cpuUsage = await si.currentLoad();
        const totalMemory = (memory.total / 1024 / 1024 / 1024).toFixed(2); 
        const usedMemory = ((memory.total - memory.available) / 1024 / 1024 / 1024).toFixed(2); 
        const freeMemory = (memory.available / 1024 / 1024 / 1024).toFixed(2);
        const totalDisk = (disk[0].size / 1024 / 1024 / 1024).toFixed(2); 
        const usedDisk = (disk[0].used / 1024 / 1024 / 1024).toFixed(2); 
        const freeDisk = (disk[0].available / 1024 / 1024 / 1024).toFixed(2); 

        const response = `𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝗽𝘁𝗶𝗺𝗲 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 
━━━━━━━━━━━━━━━━━━
            BotName: ${global.config.BOTNAME}
            Developer: ${global.config.OWNER}
            Uptime: ${uptime}
            Current Date & Time (Asia/Manila): ${currentDateTime}
            CPU: ${cpu.manufacturer} ${cpu.brand}
            CPU Usage: ${cpuUsage.currentLoad.toFixed(2)}%
            Total RAM: ${totalMemory} GB
            Used RAM: ${usedMemory} GB
            Free RAM: ${freeMemory} GB
            Total ROM: ${totalDisk} GB
            Used ROM: ${usedDisk} GB
            Free ROM: ${freeDisk} GB
            Server Region: ${os.hostname()}
        `;

        api.editMessage(response, load.messageID, event.threadID, event.messageID);
    } catch (error) {
        api.sendMessage(`${error.message}`, event.threadID);
    }
};
