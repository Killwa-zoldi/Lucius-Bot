const config = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "بوت",
  description: "يعرض معلومات عن البوت مع زر قناة",
  async run(sock, m, args) {
    try {
      const from = m.key.remoteJid;

      // صورة ثابتة للبوت
      const customImage = "https://i.ibb.co/MDR4GFgf/8613bf9a4a587e4455e3bfcffea1ef32.webp";

      // تفاعل مع الرسالة
      await sock.sendMessage(from, { react: { text: "🤖", key: m.key } });

      // حساب عدد أوامر البوت
      const commandsDir = path.join(__dirname);
      const commandsFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));
      const totalCommands = commandsFiles.length;

      // نص المعلومات مزخرف
      const botInfo = `
*╔═══════⊹⊱❖⊰⊹════════╗*
       ˼👋🏻˹ *✦ مـرحـبـاً بـك/ي 𝐌𝐄𝐆𝐔𝐌𝐈 ✦*
*╚════════⊹⊱❖⊰⊹═══════╝*

> *✦˼🪪˹↜ مــعــلــومــاتــك ↶*
*╭────────⊹⊱❖⊰⊹───────╮*
*┃ ˼🌺˹ اسم البوت ⟪ ${config.BOT_NAME} ⟫*
*┃ ˼🍷˹ المطور ⟪ ${config.DEV_NAME} ⟫*
*┃ ˼💻˹ لغة البوت ⟪ JavaScript ⟫*
*┃ ˼⚡˹ عدد الأوامر ⟪ ${totalCommands} ⟫*
*╰────────⊹⊱❖⊰⊹───────╯*

*╔═══════⊹⊱❖⊰⊹══════╗*
    *──〔 ${config.BOT_NAME} 〕──*
*╚═══════⊹⊱❖⊰⊹══════╝*
*✪┋𝙗𝙮 ✦ ${config.DEV_NAME} ✦┋✪*
`;

      // إرسال الصورة مع الكابشن + زر قناة
      await sock.sendMessage(from, {
        image: { url: customImage },
        caption: botInfo,
        footer: "قـــنـاة الــبـــوت",
        templateButtons: [
          {
            urlButton: {
              displayText: "قـــنـاة الــبـــوت",
              url: "https://whatsapp.com/channel/0029VbBc8wq4o7qMV6TK6F2i"
            }
          }
        ]
      });

    } catch (err) {
      console.error("خطأ في أمر .بوت:", err);
    }
  }
};