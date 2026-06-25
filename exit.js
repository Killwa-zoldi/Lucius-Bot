const config = require("../config"); // للتأكد من وجود DEVELOPERS

module.exports = {
  name: "خرج",
  description: "يخرج البوت من المجموعة (للمطور فقط).",
  run: async (sock, m, args) => {
    try {
      const from = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;

      // تحقق أن الأمر في مجموعة
      if (!from.endsWith("@g.us")) {
        return sock.sendMessage(from, { text: "❌ هذا الأمر يعمل فقط داخل المجموعات." }, { quoted: m });
      }

      // تحقق أن المرسل مطور
      if (!config.DEVELOPERS.includes(sender)) {
        return sock.sendMessage(from, { text: "🚫 هذا أمر للمطور فقط." });
      }

      // إرسال رسالة وداع قبل الخروج
      await sock.sendMessage(from, { 
        text: "*وداعــــــــــا يا رفـــــــاق 👋🏻 لقد قــيــضـــيـــنا وقـــت مـــمــتـــع 🙌🏻*" 
      });

      // مغادرة المجموعة
      await sock.groupLeave(from);

    } catch (err) {
      console.error('خطأ في أمر .خرج:', err);
      await sock.sendMessage(from, { text: "⚠️ حدث خطأ أثناء محاولة الخروج." }, { quoted: m });
    }
  }
};