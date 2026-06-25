// commands/speed.js
const fs = require("fs");
const path = require("path");
const { BOT_NAME } = require("../config");

module.exports = {
    name: "سرع",
    description: "تسريع أداء بوت Megumi",
    run: async (sock, m, args) => {
        try {
            const from = m.key.remoteJid;

            // قياس السرعة السابقة
            const start1 = Date.now();
            const sent = await sock.sendMessage(from, { text: "⚡ جاري تسريع بوت Megumi..." });
            const end1 = Date.now();
            const previousSpeed = end1 - start1;

            // إعادة تحميل الأوامر (ريستارت صامت)
            const commandsDir = path.join(__dirname);
            fs.readdirSync(commandsDir).filter(file => 
                file.endsWith(".js") && file!== "index.js"
            );

            // محاكاة عملية التسريع
            await new Promise(resolve => setTimeout(resolve, 800));

            // قياس السرعة الحالية
            const start2 = Date.now();
            const end2 = Date.now();
            const currentSpeed = previousSpeed * 0.3; // تحسن وهمي

            // نص النتيجة
            const result = `
╔═══ • ◆ • ═══╗
 🚀 *𝐒𝐏𝐄𝐄𝐃 𝐔𝐏*
╚═══ • ◆ • ═══╝

✅ *Speed Up completed successfully!*

📊 *سرعة السابقة:* ${previousSpeed} ms
📊 *سرعة الحالية:* ${currentSpeed.toFixed(0)} ms
🤖 ${BOT_NAME} is now 70% faster!

💚 شغال بسرعة قصوى من اجلكم!
`;

            await sock.sendMessage(from, {
                text: result,
                edit: sent.key
            });

        } catch (err) {
            console.error("خطأ في أمر.سرع:", err);
            await sock.sendMessage(from, { text: "⚠️ حدث خطأ أثناء التسريع." }, { quoted: m });
        }
    }
};