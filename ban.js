const fs = require("fs");
const path = require("path");
const config = require("../config");

const banPath = path.join(__dirname, "../data/ban.json");
if (!fs.existsSync(banPath)) fs.writeFileSync(banPath, JSON.stringify({}, null, 2));

const readBan = () => JSON.parse(fs.readFileSync(banPath));
const saveBan = (d) => fs.writeFileSync(banPath, JSON.stringify(d, null, 2));

module.exports = {
  name: "حظر",
  description: "إيقاف / تشغيل استجابة البوت لشخص معيّن (مثل ستت)",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    // مطور فقط
    if (!config.DEVELOPERS.includes(sender)) {
      return sock.sendMessage(from, { text: "🚫 الأمر للمطور فقط." }, { quoted: m });
    }

    const action = args[0];
    const target =
      m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      m.message.extendedTextMessage?.contextInfo?.participant;

    const banned = readBan();

    if (!action) {
      return sock.sendMessage(from, {
        text: "❗ استخدم:\n.حظر شغل @شخص\n.حظر وقف @شخص\n.حظر حالة @شخص"
      }, { quoted: m });
    }

    if (!target && action !== "عرض") {
      return sock.sendMessage(from, { text: "❗ منشن الشخص أو رد على رسالته." }, { quoted: m });
    }

    // === شغل ===
    if (action === "شغل") {
      banned[target] = true;
      saveBan(banned);
      return sock.sendMessage(from, {
        text: `⛔ تم إيقاف استجابة البوت لـ @${target.split("@")[0]}`,
        mentions: [target]
      }, { quoted: m });
    }

    // === وقف ===
    if (action === "وقف") {
      delete banned[target];
      saveBan(banned);
      return sock.sendMessage(from, {
        text: `✅ تم تفعيل استجابة البوت لـ @${target.split("@")[0]}`,
        mentions: [target]
      }, { quoted: m });
    }

    // === حالة ===
    if (action === "حالة") {
      const state = banned[target] ? "⛔ محظور" : "✅ غير محظور";
      return sock.sendMessage(from, {
        text: `📌 حالة @${target.split("@")[0]}: ${state}`,
        mentions: [target]
      }, { quoted: m });
    }
  },

  // 🔥 هذا هو قلب الإيقاف الحقيقي
  reactMessage: async (sock, m) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    const banned = readBan();
    if (!banned[sender]) return;

    try {
      // حذف أي رسالة منه (أوامر / كلام / أي شيء)
      await sock.sendMessage(from, { delete: m.key });
    } catch {}
  }
};
