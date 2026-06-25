const fs = require('fs');
const path = require('path');
const eliteFile = path.join(__dirname, '..', 'data', 'elite.json');

module.exports = {
    name: "مسح",
    description: "مسح رسالة مستهدفة مع رسالة الأمر (خاص للنخبة)",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        let ELITE = [];
        if (fs.existsSync(eliteFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(eliteFile, 'utf8'));
                ELITE = data.elite || [];
            } catch (err) {
                console.error('خطأ في تحميل elite.json:', err);
                ELITE = [];
            }
        }

        if (!ELITE.includes(sender)) {
            return await sock.sendMessage(from, { text: "🚫 هذا الأمر مخصص للنخبة فقط!" });
        }

        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: "❌ هذا الأمر يعمل فقط داخل المجموعات." });
        }

        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.quotedMessage) {
            return await sock.sendMessage(from, { text: "⚠️ يجب الرد على رسالة تريد مسحها." });
        }

        try {
            const quotedKey = {
                remoteJid: from,
id: ctx.stanzaId,
                participant: ctx.participant
            };

            await sock.sendMessage(from, { delete: quotedKey });
            await sock.sendMessage(from, { delete: m.key });

        } catch (err) {
            console.error("خطأ في أمر .مسح:", err);
            await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء محاولة المسح." });
        }
    }
};