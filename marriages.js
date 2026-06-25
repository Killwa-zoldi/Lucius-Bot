const fs = require("fs");
const path = require("path");

const marriageFile = path.join(__dirname, "..", "data", "marriages.json");

// تحميل بيانات الزواج
function loadMarriages() {
  if (!fs.existsSync(marriageFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(marriageFile, "utf8"));
  } catch {
    return {};
  }
}

module.exports = {
  name: "زيجات",
  description: "عرض جميع الزيجات المسجلة",

  run: async (sock, m) => {
    const from = m.key.remoteJid;

    const marriages = loadMarriages();
    const keys = Object.keys(marriages);

    if (!keys.length) {
      return sock.sendMessage(
        from,
        { text: "💔 لا توجد أي زيجات مسجلة حالياً." },
        { quoted: m }
      );
    }

    const used = new Set();
    let index = 1;
    const lines = [];

    lines.push("╔══ 💍 𝐋𝐈𝐒𝐓 𝐎𝐅 𝐌𝐀𝐑𝐑𝐈𝐀𝐆𝐄𝐒 💍 ══╗");
    lines.push("");

    const mentions = [];

    for (const person of keys) {
      const partner = marriages[person];

      // تجاهل المكرر
      if (used.has(person) || used.has(partner)) continue;

      used.add(person);
      used.add(partner);

      lines.push(
        `💑 ${index++}. @${person.split("@")[0]}  ❤️  @${partner.split("@")[0]}`
      );

      mentions.push(person, partner);
    }

    lines.push("");
    lines.push("╚══════════════════════════════╝");
    lines.push("> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓");

    await sock.sendMessage(
      from,
      {
        text: lines.join("\n"),
        mentions
      },
      { quoted: m }
    );
  }
};