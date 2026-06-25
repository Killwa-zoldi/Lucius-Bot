const fs = require('fs');
const path = require('path');
const config = require('../config');

const groupsFile = path.join(__dirname, '..', 'data', 'groups.json');

function loadGroups() {
    if (!fs.existsSync(groupsFile)) return { groups: {} };
    try {
        return JSON.parse(fs.readFileSync(groupsFile, 'utf8'));
    } catch {
        return { groups: {} };
    }
}

module.exports = {
    name: "لصق",
    description: "يطبق نسخة محفوظة على اسم ووصف وصورة الغروب (للمطور فقط)",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        if (!config.DEVELOPERS.includes(sender)) {
            return await sock.sendMessage(from, { text: "🚫 هذا الأمر خاص بالمطور فقط." }, { quoted: m });
        }

        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: "❌ هذا الأمر يعمل في المجموعات فقط." }, { quoted: m });
        }

        const copyName = args.join(' ');
        if (!copyName) {
            return await sock.sendMessage(from, { text: "✍️ استخدم: .لصق (اسم_الحفظ)" }, { quoted: m });
        }

        try {
            const groups = loadGroups();
            const saved = groups.groups[copyName];

            if (!saved) {
                return await sock.sendMessage(from, { text: `❌ لا توجد نسخة باسم: "${copyName}"` }, { quoted: m });
            }

            // تطبيق النسخة
            await sock.groupUpdateSubject(from, saved.name);
            if (saved.description) {
                await sock.groupUpdateDescription(from, saved.description);
            }

            if (saved.image && fs.existsSync(saved.image)) {
                const imgBuffer = fs.readFileSync(saved.image);
                await sock.updateProfilePicture(from, imgBuffer);
            }

            await sock.sendMessage(from, { text: `✅ تم تطبيق نسخة "${copyName}"` }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر .لصق:", err);
            await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء تطبيق النسخة." }, { quoted: m });
        }
    }
};