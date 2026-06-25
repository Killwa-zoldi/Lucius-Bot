// commands/examine.js
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "فحص",
  description: "يفحص جميع أوامر البوت ويعرض حالة كل ملف",
  run: async (sock, msg) => {
    try {
      const from = msg.key.remoteJid;
      const commandsPath = path.join(__dirname);
      const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js") && f !== "examine.js");

      let report = "*🛠️ فحص جميع الأوامر 🛠️*\n\n";

      for (const file of files) {
        const filePath = path.join(commandsPath, file);
        try {
          delete require.cache[require.resolve(filePath)]; // إعادة تحميل الملف
          require(filePath); // محاولة استدعاء الأمر
          report += `✅ ${file} → سليم\n`;
        } catch (err) {
          report += `❌ ${file} → خطأ: ${err.message}\n`;
        }
      }

      await sock.sendMessage(from, { text: report.trim() }, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر .فحص:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ خطأ أثناء تنفيذ الفحص:\n${err.message}` }, { quoted: msg });
    }
  }
};