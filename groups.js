const config = require("../config");

module.exports = {
  name: "جروبات",
  description: "جلب تقرير كامل عن جميع المجموعات (مطور فقط)",

  run: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // مطور فقط
    if (!config.DEVELOPERS.includes(sender)) {
      return sock.sendMessage(from, {
        text: "🚫 هذا الأمر مخصص للمطور فقط."
      }, { quoted: msg });
    }

    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupList = Object.values(groups);

      if (!groupList.length) {
        return sock.sendMessage(from, {
          text: "❌ البوت ليس في أي مجموعة."
        }, { quoted: msg });
      }

      let report =
`╭━─━─━─━─━─━─━╮
   📋 تقرير المجموعات 📋
╰━─━─━─━─━─━─━╯

`;

      let mentioned = [];
      let count = 1;

      for (const metadata of groupList) {
        const name = metadata.subject || "بدون اسم";
        const participants = metadata.participants?.length || 0;
        const creation = metadata.creation
          ? new Date(metadata.creation * 1000).toLocaleString("ar-EG")
          : "غير معروف";

        const owner = metadata.owner || null;

        let invite = "❌ لا أملك صلاحية الرابط";
        try {
          const code = await sock.groupInviteCode(metadata.id);
          invite = `https://chat.whatsapp.com/${code}`;
        } catch {}

        let ownerText = "غير معروف";
        if (owner) {
          mentioned.push(owner);
          ownerText = `@${owner.split("@")[0]}`;
        }

        report +=
`╭─❖ ${count}
│ 👥 الاسم : ${name}
│ 📊 الأعضاء : ${participants}
│ 📅 تاريخ الإنشاء : ${creation}
│ 👑 المنشئ : ${ownerText}
│ 🔗 الرابط : ${invite}
╰───────────────❖

`;

        count++;
      }

      report +=
`━━━━━━━━━━━━━━━
> ${config.BOT_NAME || "BOT"} SYSTEM`;

      await sock.sendMessage(from, {
        text: report,
        mentions: mentioned
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Error in .هاتهم:", err);
      await sock.sendMessage(from, {
        text: "⚠️ حدث خطأ أثناء جلب المجموعات."
      }, { quoted: msg });
    }
  }
};