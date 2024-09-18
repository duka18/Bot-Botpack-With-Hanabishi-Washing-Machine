const fs = require('fs');
const path = require('path');
const gradient = require('gradient-string');
const { spawn } = require("child_process");
const http = require('http');
const socketIo = require('socket.io');

// Removed express function
// const express = require('express');

const server = http.createServer();
const io = socketIo(server);
// const port = 3000;

let config;
try {
  config = require('./config.json');
  console.log(gradient.mind('Config.json loaded successfully!'));
} catch (error) {
  console.error('Error loading config.json:', error.message);
  process.exit(0);
}

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

const getCommandCount = () => {
  return fs.readdirSync(commandsPath).filter(file => path.extname(file) === '.js').length;
};

const getEventCount = () => {
  return fs.readdirSync(eventsPath).filter(file => path.extname(file) === '.js').length;
};

const getUptime = () => {
  const uptime = process.uptime();
  const uptimeMessage = `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`;
  return uptimeMessage;
};

const getDashboardData = () => {
  return {
    prefix: config.prefix,
    owner: config.owner || "N/A",
    commandCount: getCommandCount(),
    eventCount: getEventCount(),
    uptime: getUptime(),
    currentTime: new Date().toISOString()
  };
};

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('dashboardData', getDashboardData());

  const interval = setInterval(() => {
    socket.emit('dashboardData', getDashboardData());
  }, 10000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

// Removed express.static middleware
// app.use(express.static('public'));

function startBot() {
  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (codeExit) => {
    console.log(`Bot process exited with code: ${codeExit}`);
    if (codeExit !== 0) {
      setTimeout(startBot, 3000); 
    }
  });

  child.on("error", (error) => {
    console.error(`An error occurred starting the bot: ${error}`);
  });
};

startBot();
// server.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
