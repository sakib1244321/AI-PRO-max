module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require('string-similarity'),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const axios = require('axios');
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY"); // fixed minute format
    const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode, adminOnly, keyAdminOnly, ndhOnly, adminPaOnly } = global.config;
    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    var { body, senderID, threadID, messageID } = event;
    if (!body) return; // ✅ Fix: no crash on sticker or empty message

    senderID = String(senderID);
    threadID = String(threadID);

    const threadSetting = threadData.get(threadID) || {};
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(threadSetting.PREFIX || PREFIX)})\\s*`);
    if (!prefixRegex.test(body)) return;

    const adminbot = require('./../../config.json');

    // Permissions check
    if (!global.data.allThreadID.includes(threadID) && !ADMINBOT.includes(senderID) && adminPaOnly == true)
      return api.sendMessage("MODE » Only admins can use bots in their own inbox", threadID, messageID);

    if (!ADMINBOT.includes(senderID) && adminOnly == true)
      return api.sendMessage('MODE » Only admins can use bots', threadID, messageID);

    if (!NDH.includes(senderID) && !ADMINBOT.includes(senderID) && ndhOnly == true)
      return api.sendMessage('MODE » Only bot support can use bots', threadID, messageID);

    // Blocked users/threads
    if ((userBanned.has(senderID) || threadBanned.has(threadID) || !allowInbox && senderID == threadID) && !ADMINBOT.includes(senderID)) {
      if (userBanned.has(senderID)) {
        const { reason, dateAdded } = userBanned.get(senderID) || {};
        return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID, async (err, info) => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return api.unsendMessage(info.messageID);
        }, messageID);
      }
      if (threadBanned.has(threadID)) {
        const { reason, dateAdded } = threadBanned.get(threadID) || {};
        return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return api.unsendMessage(info.messageID);
        }, messageID);
      }
    }

    // Argument extraction
    const [matchedPrefix] = body.match(prefixRegex);
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    let command = commands.get(commandName);
    if (!command) {
      const allCommandName = Array.from(commands.keys());
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
      if (checker.bestMatch.rating >= 0.5)
        command = commands.get(checker.bestMatch.target);
      else
        return api.sendMessage(global.getText("handleCommand", "commandNotExist", checker.bestMatch.target), threadID);
    }

    // Command ban check
    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [];
        const banUsers = commandBanned.get(senderID) || [];

        if (banThreads.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            return api.unsendMessage(info.messageID);
          }, messageID);

        if (banUsers.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            return api.unsendMessage(info.messageID);
          }, messageID);
      }
    }

    // NSFW
    if (command.config.commandCategory?.toLowerCase() == 'nsfw' && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID))
      return api.sendMessage(global.getText("handleCommand", "threadNotAllowNSFW"), threadID, async (err, info) => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return api.unsendMessage(info.messageID);
      }, messageID);

    // Permission level
    let permssion = 0;
    const threadInfoObj = threadInfo.get(threadID) || await Threads.getInfo(threadID);
    const find = threadInfoObj.adminIDs.find(el => el.id == senderID);

    if (NDH.includes(senderID)) permssion = 2;
    if (ADMINBOT.includes(senderID)) permssion = 3;
    else if (find) permssion = 1;

    if (command.config.hasPermssion > permssion)
      return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), threadID, messageID);

    // Cooldown
    if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Map());

    const timestamps = cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;

    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime)
      return api.sendMessage(`You just used this command.\nTry again after ${((timestamps.get(senderID) + expirationTime - dateNow) / 1000).toFixed(1)}s`, threadID, messageID);

    // Multi-language support
    let getText2 = () => { };
    if (command.languages?.[global.config.language])
      getText2 = (...values) => {
        let lang = command.languages[global.config.language][values[0]] || '';
        for (let i = values.length - 1; i > 0; i--) {
          const expReg = RegExp('%' + i, 'g');
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };

    // Run the command
    try {
      await command.run({
        api,
        event,
        args,
        models,
        Users,
        Threads,
        Currencies,
        permssion,
        getText: getText2
      });
      timestamps.set(senderID, dateNow);

      if (DeveloperMode === true) {
        logger(`[DEV MODE] Command: ${commandName}, From: ${senderID}, In: ${threadID}, Time: ${(Date.now() - dateNow)}ms`);
      }
    } catch (e) {
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e.message || e), threadID);
    }
  };
};
