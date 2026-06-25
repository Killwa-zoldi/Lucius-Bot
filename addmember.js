const config = require("../config");

module.exports = {
  name: "جلب",
  description: "إضافة شخص للجروب عن طريق رقمه أو إرسال لينك دعوة (للمطور فقط)",
  category: "جروبات",
  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    if (!config.DEVELOPERS.includes(sender)) {
      return sock.sendMessage(from, { text: "❌ هذا الأمر مخصص للمطور فقط." }, { quoted: m });
    }

    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: "❌ هذا الأمر يشتغل فقط داخل الجروبات." }, { quoted: m });
    }

    if (!args[0]) {
      return sock.sendMessage(from, { text: "❌ استخدم الأمر هكذا:\n.جلب +212772889143" }, { quoted: m });
    }

    const raw = args[0].replace(/\D/g, '');
    if (raw.length < 8) {
      return sock.sendMessage(from, { text: "❌ الرقم غير صحيح. لازم تبعته بكود الدولة." }, { quoted: m });
    }

    const numberJid = `${raw}@s.whatsapp.net`;

    try {
      const meta = await sock.groupMetadata(from);
      const participants = meta.participants.map(p => p.id);

      if (participants.includes(numberJid)) {
        return sock.sendMessage(from, {
          text: `ℹ️ العضو @${raw} موجود بالفعل في *${meta.subject}*.`,
          mentions: [numberJid]
        }, { quoted: m });
      }

      const result = await sock.groupParticipantsUpdate(from, [numberJid], 'add');
      const response = result[0];

      if (response.status === '200') {
        return sock.sendMessage(from, {
          text: `✅ تمت إضافة @${raw} إلى *${meta.subject}*!`,
          mentions: [numberJid]
        }, { quoted: m });
      } else {
        let inviteCode = null;
        if (typeof sock.groupInviteCode === 'function') {
          inviteCode = await sock.groupInviteCode(from);
        }

        if (inviteCode) {
          const link = `https://chat.whatsapp.com/${inviteCode}`;

          await sock.sendMessage(from, {
            text: `ℹ️ مش قادر أضيف @${raw} مباشرة. أرسلنا له لينك الدعوة.`,
            mentions: [numberJid]
          }, { quoted: m });

          await sock.sendMessage(numberJid, {
            text: `🔔 اتفضل انضم لجروب *${meta.subject}*:\n${link}`
          });

        } else {
          return sock.sendMessage(from, {
            text: `❌ فشل الإضافة ولم أستطع الحصول على لينك الدعوة.`,
          }, { quoted: m });
        }
      }

    } catch (err) {
      return sock.sendMessage(from, {
        text: `❌ خطأ: ${err.message || err}`
      }, { quoted: m });
    }
  }
};