// commands/abdi.js
const fs = require('fs');
const path = require('path');
const { DEVELOPERS } = require('../config'); // قائمة المطورين
const ABDI_FILE = path.join(__dirname, '..', 'data', 'abdi.json');
const ABDI_DURATION = 150; // مدة العبودية بالثواني

module.exports = {
    name: "عبدي",
    description: "وضع شخص في العبودية: أي رسالة = طرد",
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

        if (!target) return await sock.sendMessage(from, { text: "❌ منشن أو رد على الشخص." }, { quoted: m });
        if (abdiData[target]) return await sock.sendMessage(from, { text: "⚠️ هذا الشخص عبد بالفعل." }, { quoted: m });

        // وضع الشخص في العبودية
        abdiData[target] = { expiresAt: Date.now() + ABDI_DURATION * 1000 };
        fs.writeFileSync(ABDI_FILE, JSON.stringify(abdiData, null, 2));

        await sock.sendMessage(from, {
            text: `👑 @${target.split('@')[0]} أصبح عبد لمدة ${ABDI_DURATION} ثانية!\n🚨 أي رسالة منه = طرد`,
            mentions: [target]
        });

        // انتهاء العبودية تلقائيًا بعد المدة
        setTimeout(() => {
            delete abdiData[target];
            fs.writeFileSync(ABDI_FILE, JSON.stringify(abdiData, null, 2));
        }, ABDI_DURATION * 1000);
    }
};