const axios = require("axios");

module.exports = {
    name: "ميغومي",
    description: "يعرض حالة البوت مع معاينة القناة",
    async run(sock, m, args) {
        try {
            const from = m.key.remoteJid;

            // تفاعل مع الرسالة
            await sock.sendMessage(from, { react: { text: "🗝", key: m.key } });

            // تحميل الصورة من URL وتحويلها إلى ArrayBuffer
            const thumb = (await axios.get(
                "https://i.ibb.co/fG2Gc70p/0886729e814751408c5a7616a946fc34.webp",
                { responseType: "arraybuffer" }
            )).data;

            // رسالة مع معاينة القناة
            await sock.sendMessage(from, {
                text: "> *𝐌𝐄𝐆𝐔𝐌𝐈 𝐁𝐎𝐓 𝐈𝐒 𝐎𝐍𝐋𝐈𝐍𝐄 ✅️*",
                contextInfo: {
                    externalAdReply: {
                        title: "𝐌𝐄𝐆𝐔𝐌𝐈 𝐁𝐎𝐓 ♟️",
                        body: "𝐌𝐄𝐆𝐔𝐌𝐈 𝐁𝐎𝐓 𝐈𝐒 𝐓𝐇𝐄 𝐁𝐄𝐒𝐓 🍷",
                        mediaType: 2,
                        thumbnail: thumb,
                        sourceUrl: "https://megumi.com/channel/0029VbBc8wq4o7qMV6TK6F2i"
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر .ميغومي:", err);
            await sock.sendMessage(m.key.remoteJid, {
                text: "⚠️ حدث خطأ أثناء تنفيذ الأمر."
            }, { quoted: m });
        }
    }
};