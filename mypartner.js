const fs = require("fs");
const path = require("path");

const marriageFile = path.join(__dirname, "..", "data", "marriages.json");

function loadMarriages() {
  if (!fs.existsSync(marriageFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(marriageFile, "utf8"));
  } catch {
    return {};
  }
}

module.exports = {
  name: "شريكي",
  description: "عرض الشريك الحالي",

  run: async (sock, m) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    const marriages = loadMarriages();

    // غير متزوج
    if (!marriages[sender]) {
      return sock.sendMessage(
        from,
        { text: "💔 أنت غير مرتبط حالياً." },
        { quoted: m }
      );
    }

    const partner = marriages[sender];

    // رياكت
    try {
      await sock.sendMessage(from, {
        react: { text: "💍", key: m.key }
      });
    } catch {}

    // رسالة منسقة
    await sock.sendMessage(
      from,
      {
        text: `
╔══ 💖 𝐌𝐘 𝐏𝐀𝐑𝐓𝐍𝐄𝐑 💖 ══╗

👤 أنت: @${sender.split("@")[0]}
💞 شريكك: @${partner.split("@")[0]}

📌 الحالة: *مرتبط ❤️*

╚══════════════════════════╝
> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓
        `,
        mentions: [sender, partner]
      },
      { quoted: m }
    );
  }
};