// commands/edit.js
const axios = require("axios");
const fs = require("fs");
const config = require("../config");

module.exports = {
  name: "ايديت",
  description: "تحميل فيديو إيديت من تيك توك عن طريق البحث في API",
  category: "ترفيه",

  async run(sock, m, args) {
    const from = m.key.remoteJid;
    const query = args.join(" ").trim();

    if (!query) {
      return sock.sendMessage(from, {
        text: "⚠️ اكتب اسم الإيديت بعد الأمر:\n`.ايديت Megumi`"
      }, { quoted: m });
    }

    await sock.sendMessage(from, { react: { text: "🎬", key: m.key } });

    try {
      const searchTerm = encodeURIComponent(query + " anime edit");
      const apiUrl = `https://www.tikwm.com/api/feed/search?keywords=${searchTerm}`;

      const { data } = await axios.get(apiUrl);

      if (!data || data.code !== 0 || !data.data?.videos?.length) {
        return sock.sendMessage(from, {
          text: `❌ لم أتمكن من العثور على فيديو لـ "${query}"`
        }, { quoted: m });
      }

      const video = data.data.videos[0]; // أول نتيجة
      const videoUrl = video.play || video.download;

      const tempFile = "./temp_edit.mp4";
      const writer = fs.createWriteStream(tempFile);

      const response = await axios.get(videoUrl, { responseType: "stream" });
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const captionText = `*تـــــم تــحــمـــــــيل ايــــديت* ✅\n\n> ${config.BOT_NAME}-𝑩𝑶𝑻`;

        await sock.sendMessage(from, {
          video: fs.readFileSync(tempFile),
          mimetype: "video/mp4",
          caption: captionText
        }, { quoted: m });

        fs.unlinkSync(tempFile);
      });

      writer.on("error", async (err) => {
        console.error("Download error:", err);
        await sock.sendMessage(from, { text: "⚠️ حدث خطأ أثناء تحميل الفيديو." }, { quoted: m });
      });

    } catch (err) {
      console.error("API error:", err);
      await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء البحث عن الفيديو." }, { quoted: m });
    }
  }
};