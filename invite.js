module.exports = {
  name: "دعوة",
  description: "يعطي رابط دعوة للمجموعة الحالية.",
  run: async (sock, m, args) => {
    try {
      const from = m.key.remoteJid;

      // تحقق أن الأمر داخل مجموعة
      if (!from.endsWith("@g.us")) {
        return sock.sendMessage(from, { text: "⚠️ هذا الأمر يعمل فقط داخل المجموعات." }, { quoted: m });
      }

      const metadata = await sock.groupMetadata(from);
      const groupName = metadata.subject;

      // الحصول على رابط الدعوة
      const inviteCode = await sock.groupInviteCode(from);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

      const message = `
✨🌸 مرحبًا بك في مجموعة: *${groupName}* 🌸✨

🎉 هنا رابط الدعوة للمجموعة:
🔗 ${inviteLink}

📝 استخدم الرابط للانضمام مباشرة واستمتع بالدردشة مع الأعضاء!

💡 نصيحة: احرص على مشاركة الرابط فقط مع من تثق بهم.
`;

      await sock.sendMessage(from, { text: message });

    } catch (err) {
      console.error('خطأ في أمر .دعوة:', err);
      await sock.sendMessage(from, { text: '⚠️ حدث خطأ أثناء الحصول على رابط الدعوة.' }, { quoted: m });
    }
  }
};