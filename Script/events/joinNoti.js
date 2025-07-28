module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "CYBER BOT TEAM",
    description: "Welcome message when someone joins",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "pidusage": ""
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const path = join(__dirname, "cache", "joinvideo");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    const path2 = join(path, "randomgif");
    if (!existsSync(path2)) mkdirSync(path2, { recursive: true });
};

module.exports.run = async function ({ api, event }) {
    const { join } = global.nodemodule["path"];
    const fs = require("fs");
    const { threadID } = event;

    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? " " : global.config.BOTNAME}`, threadID, api.getCurrentUserID());

        return api.sendMessage("", event.threadID, () =>
            api.sendMessage({
                body: `Assalamu Alaikum 🤗

Thanks a lot for adding me to your group ❤️  
Ami always try korbo helpful thakte inshaAllah 🌺

Type '${global.config.PREFIX}help' to see all commands.
Bot name: CYBER BOT TEAM`,
                attachment: fs.createReadStream(__dirname + "/cache/ullash.mp4")
            }, threadID)
        );
    } else {
        try {
            const { createReadStream, existsSync, readdirSync } = global.nodemodule["fs-extra"];
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);
            const threadData = global.data.threadData.get(parseInt(threadID)) || {};
            const path = join(__dirname, "cache", "joinvideo");
            const pathGif = join(path, `${threadID}.video`);
            const gifFolder = join(path, "randomgif");

            let mentions = [], nameArray = [], memLength = [], i = 0;

            for (let user of event.logMessageData.addedParticipants) {
                const userName = user.fullName;
                nameArray.push(userName);
                mentions.push({ tag: userName, id: user.userFbId });
                memLength.push(participantIDs.length - i++);
            }
            memLength.sort((a, b) => a - b);

            let msg = (typeof threadData.customJoin == "undefined") ?
                `Assalamu Alaikum 🤗

Welcome to our group dear {name} ❤️  
Apnake amader group '{threadName}' e peye khushi holam!

Apni ei group er {soThanhVien} number member 🌺  
Ashakori apni ekhon theke amader shathe active thakben,  
help korben and moja korben!

Jodi kono help dorkar hoy, just comment or type '${global.config.PREFIX}help'  
Aro command pete likhun: '${global.config.PREFIX}menu'

Again, welcome on behalf of all members ❤️  

~ CYBER BOT TEAM` : threadData.customJoin;

            msg = msg
                .replace(/\{name}/g, nameArray.join(', '))
                .replace(/\{type}/g, (memLength.length > 1) ? 'Friends' : 'Friend')
                .replace(/\{soThanhVien}/g, memLength.join(', '))
                .replace(/\{threadName}/g, threadName);

            let formPush;

            if (existsSync(pathGif)) {
                formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
            } else if (existsSync(gifFolder)) {
                const files = readdirSync(gifFolder);
                if (files.length > 0) {
                    const randomFile = files[Math.floor(Math.random() * files.length)];
                    const randomPath = join(gifFolder, randomFile);
                    formPush = { body: msg, attachment: createReadStream(randomPath), mentions };
                } else {
                    formPush = { body: msg, mentions };
                }
            } else {
                formPush = { body: msg, mentions };
            }

            return api.sendMessage(formPush, threadID);
        } catch (e) {
            console.log(e);
        }
    }
};
