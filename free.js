// commands/free.js
const fs = require('fs');
const path = require('path');
const { DEVELOPERS } = require('../config'); // قائمة المطورين
const ABDI_FILE = path.join(__dirname, '..', 'data', 'abdi.json');

module.exports = {
    name: "حرر",
    description: "تحرير شخص من وضع عبد",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        if (!DEVELOPERS.includes(sender)) {
            return await sock.sendMessage(from, { text: "❌ هذا الأمر خاص بالمطور فقط!" }, { quoted: m });
        }

        // تحميل بيانات العبودية
        let abdiData = {};
        if (fs.existsSync(ABDI_FILE)) {
            abdiData = JSON.parse(fs.readFileSync(ABDI_FILE, 'utf8'));
        }

        // استهداف الشخص من منشن أو رد
        const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid;
        const quoted = m.message.extendedTextMessage?.contextInfo?.participant;
        const target = mentioned?.[0] || quoted;

        if (!target || !abdiData[target]) {
            return await sock.sendMessage(from, { text: "⚠️ هذا الشخص ليس عبد حاليًا." }, { quoted: m });
        }

        // تحرير الشخص
        delete abdiData[target];
        fs.writeFileSync(ABDI_FILE, JSON.stringify(abdiData, null, 2));

        await sock.sendMessage(from, {
            text: `✅ @${target.split('@')[0]} تم تحريره فورًا!`,
            mentions: [target]
        });
    }
};