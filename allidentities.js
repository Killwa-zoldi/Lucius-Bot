const fs = require("fs");
const path = require("path");
const { DEVELOPERS } = require("../config");

module.exports = {
    name: "هويات",
    description: "عرض جميع هويات المستخدمين (للمطور فقط)",

    async run(sock, m) {
        try {
            const from = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;

            // منع غير المطور
            if (!DEVELOPERS.includes(sender)) {
                return await sock.sendMessage(from, {
                    text: "🚫 هذا الأمر مخصص للمطور فقط!"
                }, { quoted: m });
            }

            const dbFile = path.join(__dirname, "../data/userProfile.json");

            if (!fs.existsSync(dbFile)) {
                return await sock.sendMessage(from, {
                    text: "⚠️ لا توجد أي هويات مسجلة."
                }, { quoted: m });
            }

            const db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
            const users = Object.keys(db);

            if (users.length === 0) {
                return await sock.sendMessage(from, {
                    text: "⚠️ لا توجد أي هويات مسجلة."
                }, { quoted: m });
            }

            let text = "📋 *قائمة كل الهويات المسجلة:*\n\n";

            for (const jid of users) {
                const u = db[jid];
                text += `━━━━━━━━━━━━━━\n`;
                text += `👤 *الاسم:* ${u.name}\n`;
                text += `🎂 *العمر:* ${u.age}\n`;
                text += `📱 *الرقم:* @${jid.split("@")[0]}\n`;
            }

            text += "━━━━━━━━━━━━━━";

            await sock.sendMessage(from, {
                text,
                mentions: users
            }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر هويات:", err);
            await sock.sendMessage(from, {
                text: "❌ حدث خطأ أثناء عرض الهويات."
            }, { quoted: m });
        }
    }
};