const axios = require('axios');
const fs = require('fs-extra');
const request = require('request');
const moment = require('moment-timezone');

module.exports.config = {
  name: "botinfo",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Modified by Sakib",
  description: "Show bot information",
  commandCategory: "system",
  cooldowns: 1,
};

module.exports.run = async function({ api, event }) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const currentTime = moment().tz("Asia/Dhaka").format("D/MM/YYYY — HH:mm:ss");

  const info = `
☄️ BOT INFO ☄️

👤 Bot Owner: Sakib
🎂 বয়স: ১৬ বছর
🏠 বাসা: ঢাকা, বাংলাদেশ
📛 বট নাম: Sakib bot 👀
⚡ চলমান সময়: ${hours}h ${minutes}m ${seconds}s
📅 তারিখ ও সময়: ${currentTime}
🌸 Prefix: ${global.config.PREFIX || '!'}
  `;

  // অ্যাটাচমেন্ট সহ পাঠাতে চাইলে (উদাহরণ ছবি নিচে দেওয়া)
  const imageUrl = "https://i.postimg.cc/QdgH08j6/wa1.jpg";
  const imagePath = __dirname + "/cache/botinfo.jpg";

  // ডাউনলোড করে ফাইল পাঠানো
  await new Promise((resolve) =>
    request(encodeURI(imageUrl))
      .pipe(fs.createWriteStream(imagePath))
      .on("close", resolve)
  );

  // পাঠানো হচ্ছে
  return api.sendMessage(
    {
      body: info,
      attachment: fs.createReadStream(imagePath),
    },
    event.threadID,
    () => fs.unlinkSync(imagePath)
  );
};
