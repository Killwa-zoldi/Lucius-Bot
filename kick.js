const fs = require("fs");
const path = require("path");
const eliteFile = path.join(__dirname, "..", "data", "elite.json");
const { DEVELOPERS } = require("../config");

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
  name: "طرد",
  description: "طرد عضو من المجموعة (أدمن أو نخبة)",

  async run(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const ELITE = getElite();

    // قروبات فقط
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(
        from,
        { text: "❌ هذا الأمر يعمل فقط داخل المجموعات." },
        { quoted: m }
      );
    }

    // جلب بيانات القروب
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
      .filter(p => p.admin)
      .map(p => p.id);

    const isAdmin = admins.includes(sender);
    const isElite = ELITE.includes(sender);

    // شرط (أدمن أو نخبة)
    if (!isAdmin && !isElite) {
      return sock.sendMessage(
        from,
        { text: "`❌ هـــذا امــر لـلادمــن او نــخـــبـة فـــقـط`" },
        { quoted: m }
      );
    }

    // تحديد الهدف (منشن أو رد)
    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.mentionedJid?.[0] || ctx?.participant;

    if (!target) {
      return sock.sendMessage(
        from,
        { text: "`⚠️ منشن الشخص أو رد على رسالته للطرد.`" },
        { quoted: m }
      );
    }

    // منع طرد المطورين
    if (DEVELOPERS.includes(target)) {
      return sock.sendMessage(
        from,
        { text: "`❌ لا يمكنك طرد المطور!`" },
        { quoted: m }
      );
    }

    try {
      await sock.groupParticipantsUpdate(from, [target], "remove");

      await sock.sendMessage(from, {
        text: `✅ تم طرد @${target.split("@")[0]} من المجموعة.`,
        mentions: [target]
      });

    } catch (err) {
      console.error("❌ خطأ أمر .طرد:", err);

      if (err?.output?.statusCode === 403) {
        await sock.sendMessage(
          from,
          { text: "`❌ البوت لا يملك صلاحية طرد هذا العضو.`" },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          from,
          { text: "❌ حدث خطأ أثناء تنفيذ الأمر." },
          { quoted: m }
        );
      }
    }
  }
};