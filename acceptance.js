const config = require("../config"); // للتأكد من وجود DEVELOPERS
module.exports = {
  name: "طلبات",
  description: "قبول جميع طلبات الانضمام في المجموعة (للمطور فقط).",
  run: async (sock, m, args) => {
    try {
      const from = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;

      if (!config.DEVELOPERS.includes(sender)) {
        return sock.sendMessage(from, { text: "🚫 هذا أمر للمطور فقط." }, { quoted: m });
      }

      if (!from.endsWith("@g.us")) {
        return sock.sendMessage(from, { text: "⚠️ هذا الأمر يعمل فقط داخل المجموعات." }, { quoted: m });
      }

      // جلب طلبات الانضمام
      const pending = await sock.groupRequestParticipantsList(from);

      if (!pending || pending.length === 0) {
        return sock.sendMessage(from, { text: "ℹ️ لا توجد طلبات انضمام حالياً." }, { quoted: m });
      }

      // قبول الطلبات واحدًا واحدًا
      for (const user of pending) {
        await sock.groupRequestParticipantsUpdate(from, [user.jid], "approve");
        await new Promise(resolve => setTimeout(resolve, 100)); // تأخير بسيط بين الطلبات
      }

      await sock.sendMessage(from, { text: `✅ تم قبول جميع طلبات الانضمام (${pending.length} طلب).` }, { quoted: m });

    } catch (err) {
      console.error("خطأ في أمر .طلبات:", err);
      await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء قبول الطلبات." }, { quoted: m });
    }
  }
};