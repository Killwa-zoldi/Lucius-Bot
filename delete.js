const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = {
    name: "حذف",
    run: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!config.DEVELOPERS.includes(sender)) {
            return sock.sendMessage(from, { text: "🚫 هذا الأمر للمطورين فقط." });
        }

        const cmdName = args[0];
        if (!cmdName) {
            return sock.sendMessage(from, { text: "⚠️ اكتب اسم الأمر بعد .حذف" });
        }

        const cmdPath = path.join(__dirname, `${cmdName}.js`);

        if (!fs.existsSync(cmdPath)) {
            return sock.sendMessage(from, { text: `❌ لا يوجد ملف بهذا الاسم: ${cmdName}.js` });
        }

        try {
            fs.unlinkSync(cmdPath);
            return sock.sendMessage(from, { text: `✅ تم حذف الأمر: ${cmdName}.js` });
        } catch (err) {
            console.error(err);
            return sock.sendMessage(from, { text: "❌ حدث خطأ أثناء حذف الملف." });
        }
    }
};