const config = require('../config');

module.exports = {
  name: "تسمية",
  description: "تغيير اسم المجموعة (للمطور فقط)",
  
  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // تحقق من أن المرسل مطور
    if (!config.DEVELOPERS.includes(sender)) {
      return await sock.sendMessage(from, { text: "❌ ليس لديك صلاحية لتغيير اسم المجموعة." }, { quoted: m });
    }

    // تحقق من أن الرسالة في مجموعة
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "❌ هذا الأمر يعمل فقط داخل المجموعات." }, { quoted: m });
    }

    const newName = args.join(' ').trim();
    if (!newName) {
      return await sock.sendMessage(from, { text: "✍️ أرسل الاسم الجديد بعد الأمر .تسمية" }, { quoted: m });
    }

    try {
      // النسخ الحديثة من Baileys
      await sock.groupUpdateSubject(from, newName);

      await sock.sendMessage(from, { text: `✅ تم تغيير اسم المجموعة إلى:\n"${newName}"` }, { quoted: m });
    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء تغيير اسم المجموعة." }, { quoted: m });
    }
  }
};