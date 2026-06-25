const fs = require('fs');
const path = require('path');
const eliteFile = path.join(__dirname, '..', 'data', 'elite.json');

function getElite() {
    if (!fs.existsSync(eliteFile)) return [];
    try {
        const data = JSON.parse(fs.readFileSync(eliteFile, 'utf8'));
        return data.elite || [];
    } catch (err) {
        console.error('خطأ في تحميل elite.json:', err);
        return [];
    }
}

module.exports = {
    name: "اسم",

    run: async (sock, m) => {
        try {
            const from = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;
            const ELITE = getElite();

            if (!ELITE.includes(sender)) {
                return sock.sendMessage(from, {
                    text: "🚫 هذا الأمر مخصص للنخبة فقط!"
                });
            }

            if (!from.endsWith("@g.us")) {
                return sock.sendMessage(from, {
                    text: "❌ هذا الأمر يعمل داخل القروبات فقط."
                });
            }

            const groupMeta = await sock.groupMetadata(from);
            const groupName = groupMeta.subject || "اسم غير معروف";
            const mentions = groupMeta.participants.map(p => p.id);

            await sock.sendMessage(
                from,{ text: groupName, mentions }
            );

        } catch (err) {
            console.error("خطأ في أمر اسم:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ حدث خطأ أثناء جلب اسم القروب." }
            );
        }
    }
};