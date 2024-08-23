module.exports.config = {
    name: "sendcomment",
    hasPermssion: 0,
    version: "1.0.0",
    credits: "Jonell Magallanes",
    description: "Send a comment to a specific Facebook post",
    usePrefix: true,
    commandCategory: "Utility",
    usages: "sendcomment [URL] [comment]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    if (args.length < 2) {
        return api.sendMessage("Usage: sendcomment [URL] [comment]", event.threadID, event.messageID);
    }

    const sending = await api.sendMessage("Sending Comment......", event.threadID, event.messageID);
    const url = args[0];
    const comment = args.slice(1).join(" ");

    const regexPfbid = /pfbid\w+/;
    const regexPostSegment = /\/posts\/(\w+)/;
    const regexGroupID = /\/groups\/[^/]+\/permalink\/(\d+)/;

    let postID = url.match(regexPfbid);

    if (!postID) {
        let match = url.match(regexPostSegment);
        if (!match) {
            match = url.match(regexGroupID);
        }
        postID = match ? match[1] : null; 
    } else {
        postID = postID[0];
    }

    api.editMessage("Extracting URL POST Into POST ID", sending.messageID, event.threadID, event.messageID);

    if (!postID) {
        return api.editMessage("Invalid URL. Please provide a valid Facebook post URL.", sending.messageID, event.threadID, event.messageID);
    }

    try {
        await api.sendComment(comment, postID);
        api.editMessage(`𝗖𝗼𝗺𝗺𝗲𝗻𝘁 𝗣𝗼𝘀𝘁 𝗖𝗠𝗗\n━━━━━━━━━━━━━━━━━━\nComment sent successfully!\nPOST ID: ${postID}\n━━━━━━━━━━━━━━━━━━\n`, sending.messageID, event.threadID, event.messageID);
    } catch (error) {
        api.editMessage(error.message, sending.messageID, event.threadID, event.messageID);
    }
};
