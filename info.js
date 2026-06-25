// commands/info.js
const config = require("../config");

module.exports = {
  name: "معلومات",
  description: "يعرض معلومات كاملة عن المجموعة",

  run: async (sock, m) => {
    const from = m.key.remoteJid;

    // فقط للمجموعات
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(
        from,
        { text: "❌ هذا الأمر يعمل في المجموعات فقط." },
        { quoted: m }
      );
    }

    try {
      const metadata = await sock.groupMetadata(from);

      const name = metadata.subject || "غير معروف";
      const desc = metadata.desc || "لا يوجد وصف";
      const members = metadata.participants || [];
      const totalMembers = members.length;

      const owner =
        metadata.owner ||
        members.find(p => p.admin === "superadmin")?.id ||
        "غير معروف";

      const admins = members
        .filter(p => p.admin === "admin" || p.admin === "superadmin")
        .map(p => `• @${p.id.split("@")[0]}`);

      // جلب صورة المجموعة
      let pp;
      try {
        pp = await sock.profilePictureUrl(from, "image");
      } catch {
        pp = null;
      }

      const caption = `
╔══════════════╗
        𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎
╚══════════════╝

📛 *الاسم:*
${name}

🆔 *Group ID:*
${from}

👥 *عدد الأعضاء:*
${totalMembers}

👑 *المالك:*
@${owner.split("@")[0]}

🛡️ *المشرفون:*
${admins.length ? admins.join("\n") : "لا يوجد"}

📝 *الوصف:*
${desc}
`;

      if (pp) {
        await sock.sendMessage(
          from,
          {
            image: { url: pp },
            caption,
            mentions: [owner, ...members.map(p => p.id)]
          },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          from,
          {
            text: caption,
            mentions: [owner, ...members.map(p => p.id)]
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("خطأ أمر .معلومات:", err);
      await sock.sendMessage(
        from,
        { text: "❌ حدث خطأ أثناء جلب معلومات المجموعة." },
        { quoted: m }
      );
    }
  }
};