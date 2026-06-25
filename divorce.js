const fs = require("fs");
const path = require("path");

const marriageFile = path.join(__dirname, "..", "data", "marriages.json");

// تحميل الزيجات
function loadMarriages() {
  if (!fs.existsSync(marriageFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(marriageFile, "utf8"));
  } catch {
    return {};
  }
}

// حفظ الزيجات
function saveMarriages(data) {
  fs.writeFileSync(marriageFile, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "طلاق",
  description: "الطلاق من الزوج/الزوجة الحالية",

  run: async (sock, m) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    const marriages = loadMarriages();

    // تحقق هل متزوج
    if (!marriages[sender]) {
      return sock.sendMessage(
        from,
        { text: "💔 أنت لست متزوجًا حالياً." },
        { quoted: m }
      );
    }

    const partner = marriages[sender];

    // حذف العلاقة من الطرفين
    delete marriages[sender];
    if (marriages[partner] === sender) {
      delete marriages[partner];
    }

    saveMarriages(marriages);

    // رد فعل
    try {
      await sock.sendMessage(from, {
        react: { text: "💔", key: m.key }
      });
    } catch {}

    // رسالة الطلاق
    await sock.sendMessage(
      from,
      {
        text: `
╔══ 💔 𝐃𝐈𝐕𝐎𝐑𝐂𝐄 💔 ══╗

👤 المطلق: @${sender.split("@")[0]}
👤 الطرف الآخر: @${partner.split("@")[0]}

📌 الحالة الآن: *أعزب / عزباء*

╚══════════════════════════╝
> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓
        `,
        mentions: [sender, partner]
      },
      { quoted: m }
    );
  }
};