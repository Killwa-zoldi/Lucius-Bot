const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = {
  name: "ستت",
  description: "تشغيل أو إيقاف البوت للمطور فقط",
  run: async (sock, m, args, { }, jsonData, saveJSON) => {
    const sender = m.key.participant || m.key.remoteJid;

    if (!config.DEVELOPERS.includes(sender)) {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ الأمر للمطور فقط!" }, { quoted: m });
      return;
    }

    if (!args[0]) {
      await sock.sendMessage(m.key.remoteJid, { text: `💡 حالة البوت الحالية: ${jsonData.bot?.enabled ? "شغال ✅" : "موقوف ⛔"}` }, { quoted: m });
      return;
    }

    const arg = args[0].toLowerCase();
    if (arg === "شغل") {
      jsonData.bot.enabled = true;
      saveJSON("bot");
      await sock.sendMessage(m.key.remoteJid, { text: "✅ تم تشغيل البوت الآن" }, { quoted: m });
    } else if (arg === "وقف") {
      jsonData.bot.enabled = false;
      saveJSON("bot");
      await sock.sendMessage(m.key.remoteJid, { text: "⛔ تم إيقاف البوت الآن" }, { quoted: m });
    } else if (arg === "حالة") {
      await sock.sendMessage(m.key.remoteJid, { text: `💡 حالة البوت الحالية: ${jsonData.bot?.enabled ? "شغال ✅" : "موقوف ⛔"}` }, { quoted: m });
    } else {
      await sock.sendMessage(m.key.remoteJid, { text: "❌ استخدم: شغل / وقف / حالة" }, { quoted: m });
    }
  }
};