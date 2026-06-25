// commands/getfile.js
const fs = require('fs');
const path = require('path');
const { DEVELOPERS } = require('../config');

module.exports = {
    name: 'جيب',
    description: 'جلب محتوى ملف أمر',
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        if (!DEVELOPERS.includes(sender)) {
            return await sock.sendMessage(from, { text: "🚫 هذا الأمر خاص بالمطور فقط." }, { quoted: m });
        }

        const fileName = args[0];
        if (!fileName) {
            return await sock.sendMessage(from, { text: "⚠️ اكتب اسم الملف بعد الأمر.\nمثال: .جيب abdi" }, { quoted: m });
        }

        const filePath = path.join(__dirname, `${fileName}.js`);
        if (!fs.existsSync(filePath)) {
            return await sock.sendMessage(from, { text: `❌ الملف ${fileName}.js غير موجود.` }, { quoted: m });
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            await sock.sendMessage(from, { text: `📄 محتوى الملف ${fileName}.js:\n\n${content}` }, { quoted: m });
        } catch (err) {
            console.error('خطأ في أمر .جيب:', err);
            await sock.sendMessage(from, { text: "⚠️ حدث خطأ أثناء جلب الملف." }, { quoted: m });
        }
    }
};
