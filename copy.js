const fs = require('fs');
const path = require('path');
const config = require('../config');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const groupsFile = path.join(__dirname, '..', 'data', 'groups.json');

function loadGroups() {
    if (!fs.existsSync(groupsFile)) {
        fs.writeFileSync(groupsFile, JSON.stringify({ groups: {} }, null, 2));
        return { groups: {} };
    }
    try {
        return JSON.parse(fs.readFileSync(groupsFile, 'utf8'));
    } catch {
        return { groups: {} };
    }
}

function saveGroups(data) {
    fs.writeFileSync(groupsFile, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "نسخ",
    description: "يحفظ اسم ووصف وصورة المجموعة (للمطور فقط)",
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
            return await sock.sendMessage(from, { text: "✍️ استخدم: .نسخ (اسم_الحفظ)" }, { quoted: m });
        }

        try {
            const groupMeta = await sock.groupMetadata(from);
            const groupName = groupMeta.subject || "مجموعة بدون اسم";
            const groupDesc = groupMeta.desc || "";

            // تحميل صورة المجموعة
            let profileImagePath = null;
            try {
                const profilePic = await sock.profilePictureUrl(from, 'image');
                if (profilePic) {
                    const imageBuffer = await fetch(profilePic).then(res => res.arrayBuffer());
                    profileImagePath = path.join(__dirname, '..', 'data', `group_${copyName}.jpg`);
                    fs.writeFileSync(profileImagePath, Buffer.from(imageBuffer));
                }
            } catch {}

            const groups = loadGroups();
            if (!groups.groups) groups.groups = {};

            groups.groups[copyName] = {
                jid: from,
                name: groupName,
                description: groupDesc,
                savedAt: new Date().toISOString(),
                savedBy: sender,
                image: profileImagePath
            };
            saveGroups(groups);

            await sock.sendMessage(from, { text: `✅ تم حفظ نسخة باسم: "${copyName}"` }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر .نسخ:", err);
            await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء حفظ النسخة." }, { quoted: m });
        }
    }
};