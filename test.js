const fs = require("fs");
const path = require("path");

function getTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

module.exports = {
  name: "تست",
  description: "اختبار حالة البوت",

  run: async (sock, m) => {
    const from = m.key.remoteJid;

    // مسار مجلد الأوامر
    const commandsPath = path.join(__dirname, "../commands");

    // حساب عدد ملفات الأوامر
    let commandsCount = 0;
    if (fs.existsSync(commandsPath)) {
      commandsCount = fs
        .readdirSync(commandsPath)
        .filter(f => f.endsWith(".js")).length;
    }

    const text =
`✦═════💠═════✦
🟢 *حالة السيرفر:* شغال
📦 *عدد الأوامر:* ${commandsCount}
⏰ *الوقت الحالي:* ${getTime()}
✦═════💠═════✦`;

    // Status quote وهمي
    const fakeStatusKey = {
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "STATUS_FAKE_ID"
    };

    await sock.sendMessage(
      from,
      { text },
      {
        quoted: {
          key: fakeStatusKey,
          message: {
            conversation: "WhatsApp • Status"
          }
        }
      }
    );
  }
};