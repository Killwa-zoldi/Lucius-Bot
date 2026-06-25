const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../config.js");
const config = require("../config");

module.exports = {
    name: "بريفكس",
    run: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;

        if (!config.DEVELOPERS.includes(sender)) {
            return sock.sendMessage(from, { text: "🚫 لا تمتلك صلاحية تغيير البريفكس!" });
        }

        const newPrefix = args[0];
        if (!newPrefix) {
            return sock.sendMessage(from, { text: `⚠️ الرجاء كتابة البريفكس الجديد:\nمثال: ${config.PREFIX}بريفكس /` });
        }

        // تحديث البريفكس في config.js
        let configContent = fs.readFileSync(configPath, "utf8");
        configContent = configContent.replace(/PREFIX:\s*['"].*?['"]/, `PREFIX: '${newPrefix}'`);
        fs.writeFileSync(configPath, configContent);

        // تحديث البريفكس في runtime config object
        config.PREFIX = newPrefix;

        return sock.sendMessage(from, { text: `✅ تم تغيير البريفكس بنجاح! البريفكس الجديد هو: '${newPrefix}'` });
    }
};
