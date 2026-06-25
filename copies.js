// commands/copies.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

const groupsFile = path.join(__dirname, '..', 'data', 'groups.json');

function loadGroups() {
    if (!fs.existsSync(groupsFile)) {
        return { groups: {} };
    }
    try {
        return JSON.parse(fs.readFileSync(groupsFile, 'utf8'));
    } catch {
        return { groups: {} };
    }
}

module.exports = {
    name: "منسوخ",
    description: "عرض أسماء النسخ المحفوظة فقط",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        // تحقق من المطور
        if (!config.DEVELOPERS.includes(sender)) {
            return await sock.sendMessage(from, { text: "🚫 هذا الأمر خاص بالمطور فقط." }, { quoted: m });
        }

        const groups = loadGroups();
        const backups = Object.keys(groups.groups);

        if (backups.length === 0) {
            return await sock.sendMessage(from, { 
                text: "📝 لا توجد نسخ محفوظة.\nاستخدم.نسخ (اسم) لحفظ نسخة جديدة." 
            }, { quoted: m });
        }

        let list = `📋 *النسخ المحفوظة (${backups.length}):*\n\n`;
        backups.forEach((name, index) => {
            list += `${index + 1}. *${name}*\n`;
        });

        list += `\n💡 استخدم.لصق (اسم) لتطبيق النسخة`;

        await sock.sendMessage(from, { 
            text: list 
        }, { quoted: m });
    }
};