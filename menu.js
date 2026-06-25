const fs = require("fs");
const path = require("path");
const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");
const config = require("../config");

module.exports = {
  name: "اوامر",
  description: "عرض قائمة الأوامر بشكل مزخرف مع الوقت الحالي + تحذير وصورة + أزرار",
  run: async (sock, msg) => {
    try {
      const from = msg.key.remoteJid;
      const senderId = msg.key.participant || msg.key.remoteJid;
      const username = senderId.split("@")[0];

      // رياكت
      await sock.sendMessage(from, { react: { text: "📜", key: msg.key } });

      const now = new Date();
      const pad = n => n.toString().padStart(2, "0");

      // الوقت الحالي
      const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      // وقت تشغيل البوت
      const uptimeHours = pad(Math.floor(process.uptime() / 3600));
      const uptimeMinutes = pad(Math.floor((process.uptime() % 3600) / 60));
      const uptimeSeconds = pad(Math.floor(process.uptime() % 60));
      const uptime = `${uptimeHours}:${uptimeMinutes}:${uptimeSeconds}`;

      // التاريخ واليوم
      const date = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
      const weekdays = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
      const day = weekdays[now.getDay()];

      // عدد الأوامر حسب عدد ملفات js في مجلد commands
      const commandsPath = path.join(__dirname);
      const totalCommands = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js")).length;

      const caption = `
*╔═══════⊹⊱❖⊰⊹════════╗*  
       ˼👋🏻˹ *✦ مـرحـبـاً بـك/ي @${username} ✦*  
*╚════════⊹⊱❖⊰⊹═══════╝*

> *✦˼🪪˹↜ مـعـلـومـاتـك ↶*  
*╭────────⊹⊱❖⊰⊹───────╮*  
*┃ ˼👤˹ المستخدم : ⟪ @${username} ⟫*  
*┃ ˼📝˹ عدد الأوامر : ⟪ ${totalCommands} ⟫*  
*┃ ˼⏱️˹ وقت التشغيل : ⟪ ${uptime} ⟫*  
*┃ ˼⏰˹ الساعة : ⟪ ${currentTime} ⟫*  
*┃ ˼📅˹ التاريخ : ⟪ ${date} ⟫*  
*┃ ˼📆˹ اليوم : ⟪ ${day} ⟫*  
*╰────────⊹⊱❖⊰⊹───────╯*

> *✦˼👻˹↜ مـعـلـومـات الـبـوت ↶*  
*╭────────⊹⊱❖⊰⊹───────╮*  
*┃ ˼🤖˹ اسم البوت ⟪ ${config.BOT_NAME} ⟫*  
*┃ ˼👑˹ المطور ⟪ ${config.DEV_NAME} ⟫*  
*┃ ˼💻˹ اللغة ⟪ JavaScript ⟫*  
*┃ ˼🛰️˹ حالة السيرفر ⟪ نشط ✅ ⟫*  
*╰────────⊹⊱❖⊰⊹───────╯*

*╔═══════⊹⊱❖⊰⊹══════╗*  
*──〔 ⚠️ تنبيه ⚠️ 〕──*  
*╚═══════⊹⊱❖⊰⊹══════╝*  
⚡ *البوت تحت صيانة حالياً* 🛠️🚧
`;

      // أزرار
      const buttons = [
        {
          buttonId: ".مطور",
          buttonText: { displayText: "👑 المطور" },
          type: 1
        },
        {
          buttonId: ".اوامر",
          buttonText: { displayText: "📜 قائمة الأوامر" },
          type: 1
        },
        {
          urlButton: {
            displayText: "📢 قناة البوت",
            url: "https://whatsapp.com/channel/0029VbBc8wq4o7qMV6TK6F2i"
          }
        }
      ];

      const buttonMessage = {
        image: { url: "https://i.ibb.co/5W5hBPFM/5a4e90af5c7a333e3804e89aceaf7773.webp" },
        caption,
        footer: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓",
        templateButtons: buttons,
        mentions: [senderId]
      };

      await sock.sendMessage(from, buttonMessage, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر .اوامر:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ خطأ أثناء تنفيذ الأمر:\n${err.message}` }, { quoted: msg });
    }
  }
};