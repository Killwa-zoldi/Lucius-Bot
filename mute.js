const fs = require("fs");
const path = require("path");
const config = require("../config");

const mutePath = path.join(__dirname, "../data/mute.json");
if (!fs.existsSync(mutePath)) fs.writeFileSync(mutePath, JSON.stringify([], null, 2));

function saveMute(data) {
  fs.writeFileSync(mutePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "كتم",
  description: "كتم شخص / فك الكتم / عرض المكتومين (مطور فقط)",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // 🚫 مطور فقط
    if (!config.DEVELOPERS.includes(sender)) {
      return sock.sendMessage(
        from,
        { text: "🚫 هذا الأمر للمطور فقط." },
        { quoted: m }
      );
    }

    let muted = JSON.parse(fs.readFileSync(mutePath));
    const type = args[0];

    // 🎯 تحديد الهدف (منشن أو رد)
    const target =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.participant;

    if (!type) {
      return sock.sendMessage(
        from,
        { text: "❗ استخدم:\n.كتم شغل\n.كتم وقف\n.كتم عرض" },
        { quoted: m }
      );
    }

    // 🔇 تشغيل الكتم
    if (type === "شغل") {
      if (!target) {
        return sock.sendMessage(from, { text: "❗ منشن الشخص أو رد على رسالته." }, { quoted: m });
      }

      if (!muted.includes(target)) muted.push(target);
      saveMute(muted);

      return sock.sendMessage(
        from,
        { text: `🔇 تم كتم @${target.split("@")[0]}`, mentions: [target] },
        { quoted: m }
      );
    }

    // 🔊 إيقاف الكتم
    if (type === "وقف") {
      if (!target) {
        return sock.sendMessage(from, { text: "❗ منشن الشخص أو رد على رسالته." }, { quoted: m });
      }

      muted = muted.filter(j => j !== target);
      saveMute(muted);

      return sock.sendMessage(
        from,
        { text: `🔊 تم رفع الكتم عن @${target.split("@")[0]}`, mentions: [target] },
        { quoted: m }
      );
    }

    // 📋 عرض المكتومين
    if (type === "عرض") {
      if (!muted.length) {
        return sock.sendMessage(from, { text: "📭 لا يوجد أحد مكتوم." }, { quoted: m });
      }

      const list = muted.map(j => `• @${j.split("@")[0]}`).join("\n");
      return sock.sendMessage(
        from,
        { text: `📌 قائمة المكتومين:\n${list}`, mentions: muted },
        { quoted: m }
      );
    }
  },

  // 🗑️ حذف أي رسالة تصدر من مكتوم
  reactMessage: async (sock, m) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    const muted = JSON.parse(fs.readFileSync(mutePath));
    if (muted.includes(sender)) {
      try {
        await sock.sendMessage(from, { delete: m.key });
      } catch (err) {
        console.error("خطأ بحذف رسالة المكتوم:", err);
      }
    }
  }
};