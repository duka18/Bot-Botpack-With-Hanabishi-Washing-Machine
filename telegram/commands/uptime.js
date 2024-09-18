const os = require('os');
const si = require('systeminformation');
const fs = require('fs');
const path = require('path');
  const configPath = path.join( './config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
module.exports = (bot) => ({
  name: "uptime",
  desc: "Get detailed uptime and system information",
  credit: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 6,

  execute: async (msg) => {
    const chatId = msg.chat.id;


    const loadingMessage = await bot.sendMessage(chatId, "Loading....");

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
BotName: ${config.botName}
Developer: ${config.owner}
Prefix: ${config.prefix}
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

    
      bot.editMessageText(response, {
        chat_id: chatId,
        message_id: loadingMessage.message_id
      });

    } catch (error) {
     bot.sendMessage(chatId, `❌ | Sorry, there was an error getting the system information: ${error.message}`);
    }
  }
});
