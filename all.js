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
  name: "كل",
  description: "إعادة توجيه رسالة لكل أعضاء القروب بمنشن مخفي (أدمن أو نخبة) مع Status وهمي",

  async run(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const ELITE = getElite();

    // قروبات فقط
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(
        from,
        { text: "❌ هذا الأمر يعمل داخل المجموعات فقط." },
        { quoted: m }
      );
    }

    // بيانات القروب
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

    // لازم يكون رد
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    if (!quoted?.quotedMessage) {
      return sock.sendMessage(
        from,
        { text: "`⚠️ لازم ترد على رسالة عشان أعيد توجيهها.`" },
        { quoted: m }
      );
    }

    try {
      // جميع الأعضاء (منشن مخفي)
      const members = metadata.participants.map(p => p.id);

      // رد وهمي Status
      const fakeStatusQuote = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast"
        },
        message: {
          conversation: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓"
        }
      };

      // رسالة Forward
      const forwardMsg = {
        key: {
          remoteJid: from,
          fromMe: false,
          id: quoted.stanzaId,
          participant: quoted.participant
        },
        message: quoted.quotedMessage
      };

      // إرسال التوجيه
      await sock.sendMessage(
        from,
        {
          forward: forwardMsg,
          mentions: members
        },
        { quoted: fakeStatusQuote }
      );

      // حذف رسالة الأمر
      if (!m.key.fromMe) {
        await sock.sendMessage(from, { delete: m.key });
      }

    } catch (err) {
      console.error("❌ خطأ أمر .كل:", err);
      await sock.sendMessage(
        from,
        { text: "❌ حدث خطأ أثناء التنفيذ." },
        { quoted: m }
      );
    }
  }
};