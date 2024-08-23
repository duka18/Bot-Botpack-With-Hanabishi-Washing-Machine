const cron = require('node-cron');
const logger = require('./utils/log');
const axios = require("axios");
const fs = require('fs-extra');
const PREFIX = true;

module.exports = async ({ api }) => {
  const config = {
    autoRestart: {
      status: true,
      time: 40,
      note: 'To avoid problems, enable periodic bot restarts',
    },
    greetings: [
      {
        cronTime: '0 5 * * *',
        messages: [`Good morning! Have a great day ahead!`],
      },
      {
        cronTime: '0 8 * * *',
        messages: [`Hello Everyone Time Check 8:00 AM :>`],
      },
      {
        cronTime: '0 10 * * *',
        messages: [`Hello everyone! How's your day going?`],
      },
      {
        cronTime: '0 12 * * *',
        messages: [`Lunchtime reminder: Take a break and eat well!`],
      },
      {
        cronTime: '0 14 * * *',
        messages: [`Reminder: Don't forget your tasks for today!`],
      },
      {
        cronTime: '0 18 * * *',
        messages: [`Good evening! Relax and enjoy your evening.`],
      },
      {
        cronTime: '0 20 * * *',
        messages: [`Time to wind down. Have a peaceful evening.`],
      },
      {
        cronTime: '0 22 * * *',
        messages: [`Good night! Have a restful sleep.`],
      }
    ]
  };

  config.greetings.forEach((greeting) => {
    cron.schedule(greeting.cronTime, () => {
      api.getThreadList(20, null, ['INBOX']).then((list) => {
        list.forEach((thread) => {
          if (thread.isGroup) {
            api.sendMessage(greeting.messages[0], thread.threadID).catch((error) => {
              console.log(`Error sending message: ${error}`, 'AutoGreet');
            });
          }
        });
      }).catch((error) => {
        console.log(`Error getting thread list: ${error}`, 'AutoGreet');
      });
    }, {
      scheduled: true,
      timezone: "Asia/Manila"
    });
  });

  if (config.autoRestart.status) {
    cron.schedule(`*/${config.autoRestart.time} * * * *`, () => {
      api.getThreadList(20, null, ['INBOX']).then((list) => {
        list.forEach((thread) => {
          if (thread.isGroup) {
            // Send restart message
            api.sendMessage("🔃 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗣𝗿𝗼𝗰𝗲𝘀𝘀\n━━━━━━━━━━━━━━━━━━\nBot is restarting...", thread.threadID).then(() => {
              console.log(`Restart message sent to thread`, 'Auto Restart');
            }).catch((error) => {
              console.log(`Error sending restart message to thread ${error}`, 'Auto Restart');
            });
          }
        });
        console.log('Start rebooting the system!', 'Auto Restart');
        process.exit(1);
      }).catch((error) => {
        console.log(`Error getting thread list for restart: ${error}`, 'Auto Restart');
      });
    });
  }
};