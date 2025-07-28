const fs = global.nodemodule["fs-extra"];

module.exports.config = {
  name: "Obot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "𝗦𝗔𝗞𝗜𝗕 ✘ 𝗖𝗬𝗕𝗘𝗥 𝗕𝗢𝗧 𝗧𝗘𝗔𝗠 ☢️",
  description: "Auto reply without prefix",
  commandCategory: "NoPrefix",
  usages: "Just send message",
  cooldowns: 5,
};

module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body) return;

  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A - DD/MM/YYYY");
  const userName = await Users.getNameUser(senderID);

  const keywords = {
    "miss you": `${userName}, আমিও তোমাকে মিস করি 🥹💔`,
    "😘": `কিস পাঠানোর আগে একটা পারফিউম লাগাও ${userName} 😜`,
    "help": `👉 /help লিখে তোমার সাহায্য চাও 😊`,
    "sim": `SIM না ভাই, তুমি আমার হিয়ারিম ❤️`,
    "...": `... এর মানে বুঝি আমি, বলো ${userName} 😶`,
    "bc": `ভদ্র ভাষা ব্যবহার করো ${userName} 😐`,
    "🫦": `এই ইমোজিটা কি বোঝাতে চাও ${userName}? 😳`,
    "morning": `🌄 শুভ সকাল ${userName}, পানি খেয়েছো?`,
    "ullash": `উল্লাস ভাই এখন ব্যস্ত, তুমি বলো কিভাবে সাহায্য করতে পারি? 🤖`,
    "owner": `👑 Bot Owner: 𝗦𝗔𝗞𝗜𝗕 ✘ Facebook: fb.com/sakib.official`,
    "admin": `👨‍💻 আমার এডমিন হলেন Sakib ভাই - সবচেয়ে কিউট 🐼`,
    "ai": `AI ব্যবহারের জন্য /ai কমান্ড ব্যবহার করো`,
    "chup": `${userName}, তুমি চুপ করো না, কথা বলো! 😅`,
    "assalamualaikum": `🤲 ওয়ালাইকুম আসসালাম ওয়া রাহমাতুল্লাহ ${userName} 🌙`,
    "kiss me": `আমি রোবট... শুধু ভার্চুয়াল কিস 😘🤖`,
    "thank you": `স্বাগতম ${userName}, তোমার হাসিই আমার পুরস্কার 😊`,
    "হুম": `হুম হুম... কিছু বলো ${userName} 😊`,
    "name": `আমার নাম CYBER AI ChatBot 🤖`,
    "i love you": `I love you too ${userName} ❤️😊`,
    "bye": `বিদায় ${userName}, আবার এসো 🥺`,
    "tumi khaiso": `না ${userName}, তোমার হাতের রান্না খেতে চাই 🍛`,
    "ami Sakib": `ওহ, তাহলে তুমি বস সাকিব! 🤝 কেমন আছো?`,
    "/bot": `⏰ Time: ${time}\n👤 User: ${userName}\n🤖 BOT: Active and ready!`
  };

  const text = body.toLowerCase();
  for (let key in keywords) {
    if (text.includes(key)) {
      return api.sendMessage(keywords[key], threadID, messageID);
    }
  }

  // Optional random replies
  const randomReplies = [
    `${userName}, তুমি কি জানো তোমার হাসি দিনটাকে সুন্দর করে তোলে ☀️`,
    `${userName}, তুমি আসলেই অসাধারণ 🥰`,
    `এই ${userName}, আজ কি ভালো লাগছে? 😊`,
    `${userName}, তোমার মতো আর কেউ নেই 🤗`,
    `আজকের দিনটা হোক ${userName} এর মতোই স্পেশাল! ✨`
  ];

  if (Math.random() < 0.05) { // 5% chance for random message
    return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], threadID);
  }
};

module.exports.run = function({ api, event }) { };
