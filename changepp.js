const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const fs = require("fs");
const config = require("../config");
const path = require("path");

module.exports = {
  name: "غير",
  description: "تغيير صورة بروفايل المجموعة بالرد على صورة (مطور فقط)",

  run: async (sock, m) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // يعمل فقط في الجروبات
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "❌ هذا الأمر يعمل في المجموعات فقط." }, { quoted: m });
    }

    // صلاحية مطور فقط
    if (!config.DEVELOPERS.includes(sender)) {
      return await sock.sendMessage(from, { text: "🚫 هذا الأمر للمطور فقط." }, { quoted: m });
    }

    // رياكشن
    await sock.sendMessage(from, { react: { text: "🖼️", key: m.key } });

    // التأكد من الرد على صورة
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.imageMessage) {
      return await sock.sendMessage(from, { text: "⚠️ رد على صورة لتغيير بروفايل المجموعة." }, { quoted: m });
    }

    try {
      // تحميل الصورة كـ Buffer
      const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // معالجة الصورة بـ sharp (تغيير الحجم إلى 720x720)
      const processedBuffer = await sharp(buffer)
        .resize(720, 720, { fit: "cover" })
        .toFormat("jpeg")
        .toBuffer();

      // رفع الصورة للمجموعة
      await sock.updateProfilePicture(from, processedBuffer);

      await sock.sendMessage(from, { text: "✅ تم تغيير صورة بروفايل المجموعة بنجاح." }, { quoted: m });

    } catch (err) {
      console.error("خطأ تغيير صورة المجموعة:", err);
      await sock.sendMessage(from, { text: "❌ فشل تغيير صورة بروفايل المجموعة." }, { quoted: m });
    }
  }
};