const config = require("../config");

module.exports = {
    name: "قناتي",
    description: "يرسل رسالة كأنها معاد توجيهها من قناة البوت (نص فقط)",
    async run(sock, m) {
        try {
            const from = m.key.remoteJid;

            // تفاعل
            await sock.sendMessage(from, {
                react: { text: "📢", key: m.key }
            });

            const text =
`📢 *دي هي قناتي الرسمية*
🔥 ~يلا خش وتابع الجديد~
🚀 _محتوى قوي – تحديثات – مفاجآت_`;

            await sock.sendMessage(from, {
                text,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363421488192809@newsletter",
                        newsletterName: `${config.BOT_NAME} 🔥`,
                        serverMessageId: -1
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر .قناة:", err);
            await sock.sendMessage(m.key.remoteJid, {
                text: "❌ حدث خطأ أثناء تنفيذ الأمر."
            }, { quoted: m });
        }
    }
};