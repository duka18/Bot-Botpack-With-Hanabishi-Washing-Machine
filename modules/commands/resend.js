module.exports.config = {
	name: "resend",
	version: "2.0.0",
	hasPermssion: 1,
	credits: "Thọ & Mod By DuyVuong",
	description: "Là resend thôi",
	commandCategory: "general", 
	usages: "resend",
usePrefix: true,
	cooldowns: 0,
	hide: true,
	dependencies: {
		"request": "",       
		"fs-extra": "",
		"axios": ""
	}
};

module.exports.handleEvent = async function({ event, api, client, Users }) {
	const request = global.nodemodule["request"];
	const axios = global.nodemodule["axios"];
	const { writeFileSync, createReadStream } = global.nodemodule["fs-extra"];
	let { messageID, senderID, threadID, body: content } = event;
	
	if (!global.logMessage) global.logMessage = new Map();	
	if (!global.data.botID) global.data.botID = api.getCurrentUserID();

	const thread = global.data.threadData.get(parseInt(threadID)) || {};
  
	if (typeof thread["resend"] === "undefined" || thread["resend"] === false) return;
	if (senderID == global.data.botID) return;

	if (event.type !== "message_unsend") {
		global.logMessage.set(messageID, {
			msgBody: content,
			attachment: event.attachments
		});
	}
	
	if (event.type === "message_unsend") {
		const getMsg = global.logMessage.get(messageID);
		if (!getMsg) return;
		let name = await Users.getNameUser(senderID);
		
		if (!getMsg.attachment[0]) {
			return api.sendMessage(`${name} unsent the message\n\nContent: ${getMsg.msgBody}`, threadID);
		} else {
			let num = 0;
			let msg = {
				body: `${name} unsent the message\n${getMsg.attachment.length} Attachments${(getMsg.msgBody !== "") ? `\n\nContent: ${getMsg.msgBody}` : ""}`,
				attachment: [],
				mentions: [{ tag: name, id: senderID }]
			};

			for (let i of getMsg.attachment) {
				num += 1;
				let getURL = await request.get(i.url);
				let pathname = getURL.uri.pathname;
				let ext = pathname.substring(pathname.lastIndexOf(".") + 1);
				let path = __dirname + `/cache/${num}.${ext}`;
				let data = (await axios.get(i.url, { responseType: 'arraybuffer' })).data;
				writeFileSync(path, Buffer.from(data, "utf-8"));
				msg.attachment.push(createReadStream(path));
			}

			api.sendMessage(msg, threadID);
		}
	}
};

module.exports.handleReaction = async function({ api, event, client }) {
	const { messageID, reaction, threadID, userID } = event;
	const thread = global.data.threadData.get(parseInt(threadID)) || {};

	if (typeof thread["resend"] === "undefined" || thread["resend"] === false) return;

	if (reaction === "👍") {
		return api.unsendMessage(messageID, (err) => {
			if (err) return api.sendMessage("Failed to unsend the message", threadID);
		});
	}
};

module.exports.run = async function({ api, event, Threads }) {
	const { threadID, messageID } = event;
	let data = (await Threads.getData(threadID)).data;
	
	if (typeof data["resend"] === "undefined" || data["resend"] === false) data["resend"] = true;
	else data["resend"] = false;

	await Threads.setData(parseInt(threadID), { data });
	global.data.threadData.set(parseInt(threadID), data);
	
	return api.sendMessage(`Resend is ${(data["resend"] === true) ? "enabled" : "disabled"} successfully!`, threadID, messageID);
};
