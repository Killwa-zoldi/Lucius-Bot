const config = require("../config");

module.exports = {
    name: "بينق",
    run: async (sock, msg) => {
        const from = msg.key.remoteJid;

        // الوقت قبل الرد
        const start = Date.now();

        // نرسل رسالة مؤقتة لقياس السرعة
        const sent = await sock.sendMessage(from, { text: "🏓 جاري القياس..." });

        // الوقت بعد الرد
        const end = Date.now();
        const speed = end - start;

        // نعدل الرسالة بالسرعة
        const result = `⚡ *سرعة استجابة البوت*\n\n` +
                       `🔸 *Ping:* ${speed} ms\n` +
                       `🤖 البوت: ${config.BOT_NAME}`;

        await sock.sendMessage(from, {
            text: result,
            edit: sent.key // تعديل الرسالة نفسها
        });
    }
};
