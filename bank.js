const fs = require('fs');
const path = require('path');
const config = require('../config');

module.exports = {
  name: "بنك",
  description: "عرض رصيدك في بنك ميغومي بزخرفة VIP",
  run: async (sock, m, args, { bank }, jsonData, saveJSON) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    if (!bank[sender]) bank[sender] = { money: 0 };
    if (!jsonData.userProfile) jsonData.userProfile = {};
    if (!jsonData.userProfile[sender]) {
      jsonData.userProfile[sender] = { name: "-", age: "-" };
    }

    await sock.sendMessage(from, {
      react: { text: "🏦", key: m.key }
    });

    const money = bank[sender].money || 0;
    const profile = jsonData.userProfile[sender];

    const msg = `
*╔══════════════════════╗*
   🏦 𝑴𝑬𝑮𝑼𝑴𝑰 𝑩𝑨𝑵𝑲 🏦
*╚══════════════════════╝*

*╭─── ⌜ 👤 معلومات الحساب ⌟ ───╮*
*┃* 🪪 المستخدم : @${sender.split("@")[0]}
*┃* 💰 الرصيد : 『 ${money} 』 درهم
*┃* 👻 الاسم : ${profile.name !== "-" ? profile.name : "❌ غير مسجل"}
*┃* 🎂 العمر : ${profile.age !== "-" ? profile.age : "❌ غير مسجل"}
*╰────────────────────────╯*

*╭─── ⌜ 🎮 طرق الربح ⌟ ───╮*
*┃* 🧠 الفوز في الألعاب
*┃* 🧩 التفكيك – الترتيب – الحزر
*┃* 🧮 الرياضيات
*┃* 🎁 فعاليات خاصة
*╰──────────────────────╯*

*╭─── ⌜ ⭐ ملاحظات ⌟ ───╮*
*┃* 💎 كل لعبة تزيد رصيدك
*┃* 🚫 لا يوجد خصم بدون تنبيه
*┃* 🏆 كن الأغنى في القروب
*╰──────────────────────╯*

*╔══════════════════════╗*
   ✦ 𝑴𝑬𝑮𝑼𝑴𝑰 - 𝑩𝑶𝑻 ✦
*╚══════════════════════╝*
    `.trim();

    await sock.sendMessage(
      from,
      { text: msg, mentions: [sender] },
      { quoted: m }
    );

    saveJSON("bank");
    saveJSON("userProfile");
  }
};