const fs = require("fs");
const path = require("path");
const eliteFile = path.join(__dirname, "..", "data/elite.json");

const warnFile = path.join(__dirname, "..", "data/warnings.json");

function loadWarnings() {
  if (!fs.existsSync(warnFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(warnFile, "utf8"));
  } catch {
    return {};
  }
}

function saveWarnings(data) {
  fs.writeFileSync(warnFile, JSON.stringify(data, null, 2));
}

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
  name: "نقص",
  description: "إنقاص إنذار لشخص (خاص للادمن أو النخبة)",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    // التأكد من العمل داخل مجموعة
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ هذا الأمر يعمل داخل المجموعات فقط." }, { quoted: m });
    }

    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const ELITE = getElite();

    const isAdmin = admins.includes(sender);
    const isElite = ELITE.includes(sender);

    // 🔐 فقط الادمن أو النخبة
    if (!isAdmin && !isElite) {
      return sock.sendMessage(from, { text: "❌ هـــذا امــر لـلادمــن او نــخـــبـة فـــقـط" }, { quoted: m });
    }

    // جلب الهدف من منشن أو رد
    const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                   m.message.extendedTextMessage?.contextInfo?.participant;

    if (!target) {
      return sock.sendMessage(from, { text: "⚠️ منشن الشخص أو رد على رسالته لإنقاص إنذاره." }, { quoted: m });
    }

    const warnings = loadWarnings();
    if (!warnings[from]) warnings[from] = {};
    if (!warnings[from][target]) warnings[from][target] = 0;

    // إنقاص الإنذار
    warnings[from][target] = Math.max(0, warnings[from][target] - 1);
    const count = warnings[from][target];
    saveWarnings(warnings);

    await sock.sendMessage(from, {
      text: `✅ تم إنقاص إنذار @${target.split("@")[0]} (${count}/5)`,
      mentions: [target]
    });
  }
};