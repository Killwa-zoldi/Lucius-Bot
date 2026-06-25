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

// حفظ بيانات الزواج
function saveMarriages(data) {
  fs.writeFileSync(marriageFile, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "زواج",
  description: "الزواج من شخص (بالرد أو المنشن)",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // 👥 قروبات فقط
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(
        from,
        { text: "❌ أمر الزواج يعمل داخل المجموعات فقط." },
        { quoted: m }
      );
    }

    // 🎯 جلب الطرف الثاني (منشن أو رد)
    const context = m.message?.extendedTextMessage?.contextInfo;
    const partner =
      context?.mentionedJid?.[0] ||
      context?.participant;

    if (!partner) {
      return sock.sendMessage(
        from,
        { text: "❌ منشن الشخص أو رد على رسالته للزواج." },
        { quoted: m }
      );
    }

    if (partner === sender) {
      return sock.sendMessage(
        from,
        { text: "😂 لا يمكنك الزواج من نفسك." },
        { quoted: m }
      );
    }

    // 📂 تحميل البيانات
    const marriages = loadMarriages();

    // 🔒 تحقق هل أحد متزوج
    if (marriages[sender]) {
      return sock.sendMessage(
        from,
        { text: "💔 أنت متزوج بالفعل ولا يمكنك الزواج مرة أخرى." },
        { quoted: m }
      );
    }

    if (marriages[partner]) {
      return sock.sendMessage(
        from,
        { text: "💔 هذا الشخص متزوج بالفعل." },
        { quoted: m }
      );
    }

    // 💍 تسجيل الزواج
    marriages[sender] = partner;
    marriages[partner] = sender;
    saveMarriages(marriages);

    // ❤️ تفاعل
    await sock.sendMessage(from, {
      react: { text: "💍", key: m.key }
    });

    // 📤 رسالة منظمة
    const msg = `
╔═══ 💍 𝐌𝐀𝐑𝐑𝐈𝐀𝐆𝐄 💍 ═══╗
  
👑 الزوج :
@${sender.split("@")[0]}

💖 الزوجة :
@${partner.split("@")[0]}

✨ مبروك الزواج!
نتمنى لكم حياة سعيدة 💞

╚══════════════════════╝
> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓
    `;

    await sock.sendMessage(
      from,
      {
        text: msg,
        mentions: [sender, partner]
      },
      { quoted: m }
    );
  }
};