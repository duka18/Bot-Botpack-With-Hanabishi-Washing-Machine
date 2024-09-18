const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const gradient = require('gradient-string');
const { execSync } = require('child_process');

// Load configuration
let config;
try {
  config = require('./config.json');
  console.log(gradient.mind("Successful Configuration!"));
} catch (error) {
  console.error('Error loading config.json:', error.message);
  process.exit(0);
}

const token = config.token;
const usersDBPath = path.join(__dirname, 'users.json');

const bot = new TelegramBot(token, { polling: true });
const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');
const cooldowns = new Map();

let users = [];
try {
  users = JSON.parse(fs.readFileSync(usersDBPath));
} catch (error) {
  console.error('Error loading users:', error);
}

const saveUsers = () => {
  fs.writeFileSync(usersDBPath, JSON.stringify(users, null, 2));
};

const installModule = (moduleName) => {
  try {
    console.log(`Installing missing module: ${moduleName}`);
    execSync(`npm install ${moduleName}`);
    console.log(`Module ${moduleName} installed successfully.`);
  } catch (error) {
    console.error(`Error installing module ${moduleName}:`, error.message);
  }
};

const loadCommands = () => {
  fs.readdir(commandsPath, (err, files) => {
    if (err) {
      console.error('Error reading commands directory:', err);
      return;
    }
    console.log(gradient.vice("======COMMAND DEPLOYMENT LAUNCH======="));
    files.forEach(file => {
      if (path.extname(file) === '.js') {
        try {
          const command = require(path.join(commandsPath, file));
          const cmd = command(bot);

          if (cmd.onPrefix) {
            bot.onText(new RegExp(`^${config.prefix}${cmd.name}`, 'i'), (msg) => {
              handleCommand(cmd, msg);
            });
          } else {
            bot.onText(new RegExp(`^${cmd.name}`, 'i'), (msg) => {
              handleCommand(cmd, msg);
            });

            bot.onText(new RegExp(`^${config.prefix}${cmd.name}`, 'i'), (msg) => {
              bot.sendMessage(msg.chat.id, `This command "${cmd.name}" no needs a prefix.`);
            });
          }

          console.log(gradient.summer(`DEPLOYED COMMANDS • [ ${cmd.name} ]`));
        } catch (error) {
          if (error.code === 'MODULE_NOT_FOUND') {
            const missingModule = error.message.match(/'([^']+)'/)[1];
            installModule(missingModule);
          } else {
            console.error('Error deploying command:', error.message);
          }
        }
      }
    });
    showReadyMessage();
  });
};

const handleCommand = (cmd, msg) => {
  const userId = msg.from.id;
  const commandName = cmd.name;
  const cooldownTime = cmd.cooldowns * 1000;

  if (cooldowns.has(`${userId}-${commandName}`)) {
    const lastUsage = cooldowns.get(`${userId}-${commandName}`);
    const remainingTime = cooldownTime - (Date.now() - lastUsage);

    if (remainingTime > 0) {
      const remainingSeconds = Math.ceil(remainingTime / 1000);
      bot.sendMessage(msg.chat.id, `The command "${commandName}" is on cooldown. Please wait ${remainingSeconds} seconds to use it again.`);
      return;
    }
  }

  cmd.execute(msg);
  cooldowns.set(`${userId}-${commandName}`, Date.now());
};

const loadEvents = () => {
  fs.readdir(eventsPath, (err, files) => {
    if (err) {
      console.error('Error reading events directory:', err);
      return;
    }
    console.log(gradient.vice("======EVENTS COMMAND DEPLOYMENT======="));
    files.forEach(file => {
      if (path.extname(file) === '.js') {
        try {
          const eventHandler = require(path.join(eventsPath, file)); 
          eventHandler(bot);

          console.log(gradient.morning(`DEPLOYED EVENTS CMD • [ ${file} ]`));
        } catch (error) {
          if (error.code === 'MODULE_NOT_FOUND') {
            const missingModule = error.message.match(/'([^']+)'/)[1];
            installModule(missingModule);
          } else {
            console.error('Error deploying event:', error.message);
          }
        }
      }
    });
    showReadyMessage();
  });
};

const showReadyMessage = () => {
  const currentDate = new Date();
  const uptime = process.uptime();
  const uptimeMessage = `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`;
  console.log(gradient.mind(`Telegram bot is Ready\nUptime: ${uptimeMessage}\nDate: ${currentDate.toISOString()}`));
};

loadCommands();
loadEvents();

bot.on('polling_error', (error) => {
  console.error(`Polling error: ${error.code}`);
});

console.log(gradient.atlas(`System Prefix: ${config.prefix}`));
process.on('SIGINT', () => {
  saveUsers();
  console.log(gradient.morning('User data saved. Exiting...'));
  process.exit(0);
});

console.log(gradient.mind("Logging in......... ☁️"));
console.log(gradient.mind(`Deploying assets...... 🚀`));
console.log(gradient.mind('Telegram Bot is running....... '));
console.log(gradient.mind('Next Deploying Facebook Bot Please Wait....'));