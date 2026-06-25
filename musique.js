const axios = require("axios");
const config = require("../config");

module.exports = {
  name: "اغنية",
  description: "تحميل صوت من تيك توك بسرعة",
  async run(sock, m, args) {
    const from = m.key.remoteJid;
    const query = args.join(" ").trim();

    if (!query) {
      return sock.sendMessage(
        from,
        { text: "⚠️ اكتب اسم الأغنية من تيك توك" },
        { quoted: m }
      );
    }

    await sock.sendMessage(from, { react: { text: "🎶", key: m.key } });

    try {
      const apiUrl = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      if (!data?.data?.videos?.length) {
        return sock.sendMessage(
          from,
          { text: "❌ لم أجد نتائج." },
          { quoted: m }
        );
      }

      const v = data.data.videos[0];

      const audioUrl =
        v.music?.play ||
        v.music?.url ||
        v.music_info?.play ||
        v.music_info?.url;

      if (!audioUrl) {
        return sock.sendMessage(
          from,
          { text: "❌ هذا الفيديو لا يحتوي على صوت قابل للتحميل." },
          { quoted: m }
        );
      }

      await sock.sendMessage(
        from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          ptt: false,
          caption: `✅ *تــم تــحــمـيــل الــصــوت*

> ${config.BOT_NAME}-𝑩𝑶𝑻`
        },
        { quoted: m }
      );

      await sock.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error("MUSIQUE ERROR:", err);
      await sock.sendMessage(
        from,
        { text: "❌ حدث خطأ أثناء جلب الصوت من تيك توك." },
        { quoted: m }
      );
    }
  }
};