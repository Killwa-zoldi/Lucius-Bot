// commands/files.js
const fs = require("fs");
const path = require("path");
const { DEVELOPERS } = require('../config');

module.exports = {
    name: "ملفات",
    description: "يعرض قائمة كل ملفات مجلد commands مع عددها",
    async run(sock, m, args) {
        try {
            const from = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;

            if (!DEVELOPERS.includes(sender)) {
                return await sock.sendMessage(from, { text: "🚫 هذا الأمر خاص بالمطور فقط." }, { quoted: m });
            }

            // تفاعل مع الرسالة
            await sock.sendMessage(from, { react: { text: "📁", key: m.key } });

            // حساب عدد ملفات الأوامر
            const commandsDir = path.join(__dirname);
            const commandsFiles = fs.readdirSync(commandsDir).filter(file => 
                file.endsWith(".js") && 
                file!== "index.js"
            );
            const totalFiles = commandsFiles.length;

            if (totalFiles === 0) {
                return await sock.sendMessage(from, { 
                    text: "📂 لا توجد ملفات أوامر في مجلد commands." 
                }, { quoted: m });
            }

            // نص المعلومات
            let fileInfo = `
╔═══ • ◆ • ═══╗
 📁 *𝐌𝐀𝐋𝐅𝐀𝐓 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒*
╚═══ • ◆ • ═══╝

📊 عدد الملفات: *${totalFiles} ملف*
📂 المجلد: *commands*

📋 قائمة الملفات:
`;

            commandsFiles.forEach((file, index) => {
                const fileName = file.replace('.js', '');
                fileInfo += `\n${index + 1}. *${fileName}*`;
            });

            fileInfo += `\n\n⚡ البوت جاهز للعمل!`;

            // إرسال الرسالة
            await sock.sendMessage(from, { 
                text: fileInfo 
            }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر.ملفات:", err);
            await sock.sendMessage(from, { 
                text: "⚠️ حدث خطأ أثناء قراءة مجلد commands." 
            }, { quoted: m });
        }
    }
};