module.exports = {
  name: "بروفايل",
  description: "جلب صورة بروفايل شخص (منشن أو رد) مع رياكشن",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;

    // رياكشن عند تنفيذ الأمر
    await sock.sendMessage(from, {
      react: { text: "📸", key: m.key }
    });

    // تحديد الهدف (منشن أو رد)
    const target =
      m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      m.message.extendedTextMessage?.contextInfo?.participant;

    if (!target) {
      return await sock.sendMessage(
        from,
        { text: "⚠️ منشن الشخص أو رد على رسالته." },
        { quoted: m }
      );
    }

    try {
      // جلب صورة البروفايل
      const ppUrl = await sock.profilePictureUrl(target, "image");

      if (!ppUrl) {
        return await sock.sendMessage(
          from,
          { text: "❌ هذا الشخص ليس لديه صورة بروفايل." },
          { quoted: m }
        );
      }

      // إرسال الصورة
      await sock.sendMessage(
        from,
        {
          image: { url: ppUrl },
          caption: `🖼️ بروفايل @${target.split("@")[0]}`,
          mentions: [target]
        },
        { quoted: m }
      );

    } catch (err) {
      // تغيير الرياكشن عند الفشل
      await sock.sendMessage(from, {
        react: { text: "❌", key: m.key }
      });

      await sock.sendMessage(
        from,
        { text: "❌ هذا الشخص ليس لديه صورة بروفايل أو البروفايل خاص." },
        { quoted: m }
      );
    }
  }
};
