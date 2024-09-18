const fs = require('fs');
const path = require('path');

const senderIDAdmin = "100036956043695";

module.exports.config = {
    name: "usePrefix",
    version: "1.0.0",
    hasPermission: 2,
    description: "Enable or disable the usePrefix for a command",
    usePrefix: true,
    credits: "Jonell Magallanes",
    cooldowns: 5,
    commandCategory: "System"
};

module.exports.run = async function ({ api, event, args }) {
    const { senderID } = event;

    if (senderID !== senderIDAdmin) {
        return api.sendMessage("Not Authorized to Use This Command", event.threadID);
    }

    const splitArgs = args.join(" ").split("|").map(arg => arg.trim());
    const commandName = splitArgs[0];
    const usePrefixValue = splitArgs[1];

    if (!commandName || (usePrefixValue !== "true" && usePrefixValue !== "false")) {
        return api.sendMessage("Usage: usePrefix [commandName] | [true/false]", event.threadID);
    }

    const commandFilePath = path.join(__dirname, `${commandName}.js`);

    try {
        if (!fs.existsSync(commandFilePath)) {
            return api.sendMessage(`Command "${commandName}" does not exist.`, event.threadID);
        }

        let fileContent = fs.readFileSync(commandFilePath, 'utf-8');
        const usePrefixRegex = /usePrefix\s*:\s*(true|false)/;
        const currentUsePrefix = usePrefixRegex.exec(fileContent);

        if (currentUsePrefix && currentUsePrefix[1] === usePrefixValue) {
            return api.sendMessage(`The command "${commandName}" already has usePrefix set to ${usePrefixValue}.`, event.threadID);
        }

        if (usePrefixRegex.test(fileContent)) {
            fileContent = fileContent.replace(usePrefixRegex, `usePrefix: ${usePrefixValue}`);
        } else {
            const configRegex = /module\.exports\.config\s*=\s*{([^}]*)}/;
            const match = fileContent.match(configRegex);
            if (match) {
                const configBlock = match[1];
                const newConfigBlock = configBlock.trim().endsWith(',')
                    ? `${configBlock}\n    usePrefix: ${usePrefixValue},`
                    : `${configBlock},\n    usePrefix: ${usePrefixValue},`;
                fileContent = fileContent.replace(configRegex, `module.exports.config = {${newConfigBlock}}`);
            }
        }

        fs.writeFileSync(commandFilePath, fileContent, 'utf-8');
        api.sendMessage(`Successfully updated usePrefix for command "${commandName}" to ${usePrefixValue}.`, event.threadID);

    } catch (error) {
        console.error(error);
        api.sendMessage(`An error occurred while updating the usePrefix for command "${commandName}". Check logs for details.`, event.threadID);
    }
};
