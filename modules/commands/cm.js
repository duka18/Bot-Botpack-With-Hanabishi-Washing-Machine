module.exports.config = {
    name: "cm",
    version: "1.0.0",
    hasPermission: 0,
    description: "Send a comment on a Facebook post",
    usePrefix: true,
    commandCategory: "Test",
    cooldowns: 0, // Replace with your desired cooldown period in seconds
};

module.exports.run = async function ({ api, event, args }) {
    // Splitting args based on '|' to get postID and message
    const [postID, message] = args.join(' ').split('|').map(arg => arg.trim());

    if (!postID || !message) {
        return api.sendMessage("Please provide a valid post ID and a comment message separated by '|'.", event.threadID);
    }

    try {
        // Assuming api.sendComment is defined and works as expected
        const result = await api.setPostComment(postID, message);
        api.sendMessage(`Comment successfully posted on post ${postID}.`, event.threadID);

    } catch (error) {
        console.error("Error in cm command:", error);
        api.sendMessage("Failed to post comment. Please try again later.", event.threadID);
    }
};
