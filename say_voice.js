const fs = require("fs");
const gTTS = require("gtts");

module.exports = {
    name: "قول",

    run: async (sock, m, args) => {
        try {
            const from = m.key.remoteJid;

            // النص بعد الأمر
            const text = args.join(" ");
            if (!text) {
                return sock.sendMessage(
                    from,
                    { text: "✍️ اكتب نص بعد الأمر\nمثال: .قول مرحباً" },
                    { quoted: m }
                );
            }

            const file = `voice_${Date.now()}.mp3`;
            const gtts = new gTTS(text, "ar");

            gtts.save(file, async (err) => {
                if (err) {
                    await sock.sendMessage(
                        from,
                        { text: "❌ حدث خطأ أثناء تحويل النص إلى صوت" },
                        { quoted: m }
                    );
                } else {
                    const audio = fs.readFileSync(file);

                    await sock.sendMessage(
                        from,
                        {
                            audio: audio,
                            mimetype: "audio/mp4",
                            ptt: true // إرسال كفويس واتساب
                        },
                        { quoted: m }
                    );

                    fs.unlinkSync(file); // حذف الملف بعد الإرسال
                }
            });

        } catch (e) {
            console.error("خطأ في أمر قول:", e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ حدث خطأ غير متوقع" },
                { quoted: m }
            );
        }
    }
};