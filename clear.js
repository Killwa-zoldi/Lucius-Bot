const fs = require("fs");
const path = require("path");

module.exports = {
  name: "تنظيف",
  description: "🧹 تنظيف ملفات auth القديمة بدون سبام",

  async run(sock, m) {
    const from = m.key.remoteJid;

    try {
      // رياكت البداية
      await sock.sendMessage(from, {
        react: { text: "🧹", key: m.key }
      });

      const authPath = path.join(process.cwd(), "auth");
      const protectedFiles = ["creds.json"];
      const maxFiles = 40;

      if (!fs.existsSync(authPath)) {
        return sock.sendMessage(from, {
          text: "⚠️ مجلد الجلسة (auth) غير موجود!"
        }, { quoted: m });
      }

      // رسالة واحدة فقط
      const cleaningMsg = await sock.sendMessage(from, {
        text: "*جـــــارٍ الـتـــنــظـيـف...*"
      }, { quoted: m });

      let files = fs.readdirSync(authPath)
        .filter(f => !protectedFiles.includes(f))
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(authPath, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length <= maxFiles) {
        await sock.sendMessage(from, {
          react: { text: "✅", key: m.key }
        });

        return sock.sendMessage(from, {
          text: "✅ لا حاجة للتنظيف، الجلسة نظيفة.",
          edit: cleaningMsg.key
        });
      }

      const filesToDelete = files.slice(maxFiles);
      filesToDelete.forEach(f => {
        const filePath = path.join(authPath, f.name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      // نهاية هادئة
      await sock.sendMessage(from, {
        react: { text: "✨", key: m.key }
      });

      await sock.sendMessage(from, {
        text:
`🧹 *تم التنظيف بنجاح* ✅
• الملفات المحذوفة: ${filesToDelete.length}
• الجلسة محمية 🔒
• لا حاجة لإعادة QR

> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓`,
        edit: cleaningMsg.key
      });

    } catch (err) {
      console.error("❌ CLEAN ERROR:", err);
      await sock.sendMessage(from, {
        text: "❌ حدث خطأ أثناء التنظيف."
      }, { quoted: m });
    }
  }
};