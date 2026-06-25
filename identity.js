const fs = require("fs");
const path = require("path");

module.exports = {
    name: "هويتي",
    description: "عرض اللقب والعمر بشكل مزخرف مع منشن",

    async run(sock, m) {
        try {
            const from = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;

            const dbFile = path.join(__dirname, "../data/userProfile.json");

            if (!fs.existsSync(dbFile)) {
                return await sock.sendMessage(from, {
                    text: "⚠️ لا توجد أي سجلات بعد.\nسجل هويتك عبر:\n.تسجيل اسمك . عمرك"
                }, { quoted: m });
            }

            const db = JSON.parse(fs.readFileSync(dbFile, "utf8"));

            if (!db[sender]) {
                return await sock.sendMessage(from, {
                    text: "❌ لا يوجد ملف هوية لك.\nقم بالتسجيل أولاً:\n.تسجيل لقبك . عمرك"
                }, { quoted: m });
            }

            const user = db[sender];
            const name = user.name;
            const age = user.age;

            // نص زخرفة بسيط (يمكن تغييره)
            const fancyName = name
                .replace(/a/g, "𝒂").replace(/A/g, "𝑨")
                .replace(/e/g, "𝒆").replace(/E/g, "𝑬")
                .replace(/i/g, "𝒊").replace(/I/g, "𝑰")
                .replace(/o/g, "𝒐").replace(/O/g, "𝑶")
                .replace(/u/g, "𝒖").replace(/U/g, "𝑼");

            const text = `
┏━━ 👤 *هويتك* ━━┓
┃ ✨ *الاسم:* ${fancyName}
┃ 🎂 *العمر:* ${age}
┃ 🏷️ *المنشن:* @${sender.split("@")[0]}
┗━━━━━━━━━━━━━━┛
`;

            await sock.sendMessage(from, {
                text,
                mentions: [sender]
            }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر هويتي:", err);
            await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء عرض هويتك." }, { quoted: m });
        }
    }
};