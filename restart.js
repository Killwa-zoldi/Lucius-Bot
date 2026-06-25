const config = require("../config");
const chalk = require("chalk");

module.exports = {
  name: "ريستارت",
  description: "🔄 إعادة تشغيل البوت (للمطور فقط)",

  run: async (sock, m) => {
    try {
      const from = m.key.remoteJid;
      const sender = m.key.participant || from;

      // 🔐 مطور فقط
      if (!config.DEVELOPERS.includes(sender)) {
        return await sock.sendMessage(
          from,
          { text: "🚫 هذا الأمر مخصص للمطور فقط." },
          { quoted: m }
        );
      }

      // 📤 إشعار
      await sock.sendMessage(
        from,
        { text: "🔄 جاري إعادة تشغيل البوت..." },
        { quoted: m }
      );

      // 🖥️ لوق نظيف
      console.log(
        "\n" + chalk.bgRed.white.bold(" SYSTEM "),
        chalk.yellow("Bot restart requested by developer"),
        chalk.gray(`(${sender})`)
      );

      // ♻️ إعادة تشغيل
      process.send?.("reset"); // لو تستخدم PM2
      process.exit(0);

    } catch (err) {
      console.error("❌ خطأ في أمر ريستارت:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ حدث خطأ أثناء إعادة تشغيل البوت." },
        { quoted: m }
      );
    }
  }
};