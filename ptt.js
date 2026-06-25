const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const config = require("../config");

// ===== حقوق ميغومي =====
const RIGHTS = "© Megumi BOT";

// ===== مسارات الحفظ =====
const DATA_DIR = path.join(__dirname, "../data");
const VIDEO_PATH = path.join(DATA_DIR, "ptt_saved.mp4");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

module.exports = {
  name: "نغ",
  description: "🎥 ملاحظة مرئية (Status Style) – للمطور فقط",

  run: async (sock, m) => {
    try {
      const from = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;

      // ✅ تحقق من المطور
      if (!config.DEVELOPERS.includes(sender)) {
        return sock.sendMessage(from, { text: "❌ هذا الأمر مخصص للمطور فقط." }, { quoted: m });
      }

      if (!from.endsWith("@g.us"))
        return sock.sendMessage(from, { text: "❌ هذا الأمر يعمل داخل القروبات فقط." }, { quoted: m });

      // ===== رياكت عند التنفيذ =====
      await sock.sendMessage(from, {
        react: { text: "🎥", key: m.key }
      });

      // ===== لو في رد على فيديو → حفظه =====
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted?.videoMessage) {
        const buffer = await downloadMediaMessage(
          { message: { videoMessage: quoted.videoMessage } },
          "buffer",
          {},
          { logger: sock?.logger }
        );
        fs.writeFileSync(VIDEO_PATH, buffer);
        return sock.sendMessage(from, { text: `✅ تم تحديث فيديو الملاحظة المرئية\n💾 الحجم: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n\n${RIGHTS}` }, { quoted: m });
      }

      // ===== جلب الفيديو المحفوظ فقط =====
      if (!fs.existsSync(VIDEO_PATH)) {
        return sock.sendMessage(from, { text: "❌ لا يوجد فيديو محفوظ حالياً. قم بالرد على فيديو لتحديثه أولاً." }, { quoted: m });
      }
      const videoBuffer = fs.readFileSync(VIDEO_PATH);

      // ===== اقتباس وهمي (Status UI) =====
      const fakeStatusQuote = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast"
        },
        message: { conversation: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓" }
      };

      // ===== إرسال Video Note بسرعة =====
      await sock.sendMessage(
        from,
        {
          video: videoBuffer,
          mimetype: "video/mp4",
          ptv: true,
          caption: RIGHTS
        },
        { quoted: fakeStatusQuote }
      );

    } catch (err) {
      console.error("❌ خطأ في ng:", err);
      await sock.sendMessage(m.key.remoteJid, { text: `❌ حدث خطأ أثناء التنفيذ\n${RIGHTS}` }, { quoted: m });
    }
  }
};
