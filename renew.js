// commands/renew.js
const fs = require("fs");
const path = require("path");

const eliteFile = path.join(__dirname, "..", "data", "elite.json");

function getElite() {
  if (!fs.existsSync(eliteFile)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(eliteFile, "utf8"));
    return data.elite || [];
  } catch {
    return [];
  }
}

module.exports = {
  name: "تجديد",
  description: "تجديد رابط القروب (إلغاء القديم وإنشاء جديد)",

  run: async (sock, m) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(
        from,
        { text: "❌ هذا الأمر يعمل داخل القروبات فقط." },
        { quoted: m }
      );
    }

    const ELITE = getElite();

    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
      .filter(p => p.admin)
      .map(p => p.id);

    const isAdmin = admins.includes(sender);
    const isElite = ELITE.includes(sender);

    if (!isAdmin && !isElite) {
      return sock.sendMessage(
        from,
        { text: "`❌ هـــذا امــر لـلادمــن او نــخـــبـة فـــقـط`" },
        { quoted: m }
      );
    }

    try {
      // 🔁 تجديد الرابط
      await sock.groupRevokeInvite(from);

      const newCode = await sock.groupInviteCode(from);
      const newLink = `https://chat.whatsapp.com/${newCode}`;

      await sock.sendMessage(
        from,
        {
          text: `
🔄 *تم تجديد رابط القروب بنجاح*

🔗 الرابط الجديد:
${newLink}

⚠️ الرابط القديم لم يعد صالحًا
          `.trim()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ خطأ تجديد الرابط:", err);
      await sock.sendMessage(
        from,
        { text: "❌ فشل تجديد الرابط، تأكد أن البوت مشرف." },
        { quoted: m }
      );
    }
  }
};