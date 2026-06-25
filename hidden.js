const fs = require("fs");
const path = require("path");

const eliteFile = path.join(__dirname, "..", "data", "elite.json");

// قراءة النخبة
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
  name: "مخفي",
  description: "منشن مخفي برد System داخل القروب (نخبة أو أدمن)",

  async run(sock, m, args) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const ELITE = getElite();

    // 👥 قروبات فقط
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(
        from,
        { text: "❌ هذا الأمر يعمل داخل المجموعات فقط." },
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

    // 🔐 شرط (نخبة أو أدمن)
    if (!isAdmin && !isElite) {
      return sock.sendMessage(
        from,
        { text: "`❌ هـــذا امــر لـلادمــن او نــخـــبـة فـــقـط`" },
        { quoted: m }
      );
    }

    const text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(
        from,
        { text: "⚠️ اكتب نص بعد الأمر\nمثال: .مخفي صباح الخير" },
        { quoted: m }
      );
    }

    try {
      // جميع الأعضاء
      const members = metadata.participants.map(p => p.id);

      // 🧠 رد وهمي System (Group)
      const fakeGroupQuote = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast"
        },
        message: {
          conversation: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓"
        }
      };

      // 📤 إرسال الرسالة
      await sock.sendMessage(
        from,
        {
          text,
          mentions: members
        },
        { quoted: fakeGroupQuote }
      );

      // 🧹 حذف رسالة الأمر
      if (!m.key.fromMe) {
        await sock.sendMessage(from, { delete: m.key });
      }

    } catch (err) {
      console.error("❌ خطأ أمر .مخفي:", err);
      await sock.sendMessage(
        from,
        { text: "❌ حدث خطأ أثناء التنفيذ." },
        { quoted: m }
      );
    }
  }
};