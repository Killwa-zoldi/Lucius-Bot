const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = {
    name: "ضف",
    run: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!config.DEVELOPERS.includes(sender)) {
            return sock.sendMessage(from, { text: "🚫 هذا الأمر للمطورين فقط." });
        }

        const fileName = args[0];
        if (!fileName) {
            return sock.sendMessage(from, { text: "⚠️ استخدم: .ضف اسم_الملف مع الرد على الرسالة" });
        }

        // الرسالة التي تم الرد عليها
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(from, { text: "⚠️ عليك الرد على رسالة ليتم أخذ محتواها." });
        }

        // استخراج المحتوى بأي نوع: نص عادي أو extendedTextMessage
        let content = "";
        if (quoted.conversation) content = quoted.conversation;
        else if (quoted.extendedTextMessage?.text) content = quoted.extendedTextMessage.text;
        else content = JSON.stringify(quoted); // fallback لأي نوع آخر

        // مسار الملف الجديد
        const filePath = path.join(__dirname, `${fileName}.js`);

        if (fs.existsSync(filePath)) {
            return sock.sendMessage(from, { text: "⚠️ هذا الملف موجود مسبقاً." });
        }

        // إنشاء الملف
        fs.writeFileSync(filePath, content);

        return sock.sendMessage(from, { text: `✅ تم إنشاء الأمر: ${fileName}.js` });
    }
};
