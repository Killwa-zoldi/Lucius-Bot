const config = require('../config');

module.exports = {
  name: "وصف",
  description: "تغيير وصف المجموعة (للمطور فقط)",
  
  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // تحقق من أن المرسل مطور
    if (!config.DEVELOPERS.includes(sender)) {
      return await sock.sendMessage(from, { text: "❌ ليس لديك صلاحية لتغيير وصف المجموعة." }, { quoted: m });
    }

    // تحقق من أن الرسالة في مجموعة
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "❌ هذا الأمر يعمل فقط داخل المجموعات." }, { quoted: m });
    }

    const newDescription = args.join(' ').trim();
    if (!newDescription) {
      return await sock.sendMessage(from, { text: "✍️ أرسل الوصف الجديد بعد الأمر .وصف" }, { quoted: m });
    }

    try {
      // النسخ الحديثة من Baileys
      await sock.groupUpdateDescription(from, newDescription);

      await sock.sendMessage(from, { text: `✅ تم تغيير وصف المجموعة إلى:\n"${newDescription}"` }, { quoted: m });
    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء تغيير وصف المجموعة." }, { quoted: m });
    }
  }
};