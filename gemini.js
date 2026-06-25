module.exports = {
  name: "شات",
  description: "التواصل مع الذكاء الاصطناعي",
  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const question = args.join(" ");
    if (!question) return sock.sendMessage(from, { text: "❗ أكتب سؤالك بعد .شات" }, { quoted: m });

    try {
      const axios = require("axios");

      // 1️⃣ رياكت على الرسالة مباشرة
      await sock.sendMessage(from, { react: { text: "💬", key: m.key } });

      // 2️⃣ اظهار أن البوت يكتب
      await sock.sendMessage(from, { presence: { composing: true } });

      // 3️⃣ استدعاء Gemini API
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          contents: [
            {
              parts: [{ text: question }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": "AIzaSyDpcMFsm9-CE3ean2IZMqheica9M7vxpqo"
          }
        }
      );

      const reply = res.data.candidates[0].content.parts[0].text;

      // 4️⃣ إرسال الرد النهائي
      await sock.sendMessage(from, {
        text: `┏━━━━━━━━━━━━━┓
┃ 🤖 *𝐌𝐄𝐆𝐔𝐌𝐈 bot* ┃
┗━━━━━━━━━━━━━┛

✦═══════════════════════✦

${reply}

✦═══════════════════════✦

> *𝐌𝐄𝐆𝐔𝐌𝐈-𝑩𝑶𝑻*`
      }, { quoted: m });

      // 5️⃣ انهاء حالة الكتابة بعد الرد
      await sock.sendPresenceUpdate("paused", from);

    } catch (err) {
      console.log(err);
      await sock.sendMessage(from, { text: "❌ حدث خطأ في التواصل مع الذكاء الاصطناعي" }, { quoted: m });
    }
  }
};