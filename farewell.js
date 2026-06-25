const fs = require("fs");
const path = require("path");
const config = require("../config");

const dataDir = path.join(__dirname, "../data");
const farewellFile = path.join(dataDir, "farewell.json");
const userProfileFile = path.join(dataDir, "userProfile.json");

if (!fs.existsSync(farewellFile)) {
  fs.writeFileSync(farewellFile, JSON.stringify({ enabled: true }, null, 2));
}

if (!fs.existsSync(userProfileFile)) {
  fs.writeFileSync(userProfileFile, JSON.stringify({}, null, 2));
}

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "وداع",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    if (!config.DEVELOPERS.includes(sender)) {
      return sock.sendMessage(from, { text: "🚫 هذا الأمر للمطور فقط" });
    }

    const action = args[0];
    const state = loadJSON(farewellFile);

    if (action === "شغل") {
      state.enabled = true;
      saveJSON(farewellFile, state);
      return sock.sendMessage(from, { text: "✅ تم تفعيل الوداع" });
    }

    if (action === "وقف") {
      state.enabled = false;
      saveJSON(farewellFile, state);
      return sock.sendMessage(from, { text: "❌ تم إيقاف الوداع" });
    }

    if (action === "حالة") {
      return sock.sendMessage(from, {
        text: `📌 حالة الوداع: ${state.enabled ? "✅ مفعل" : "❌ متوقف"}`
      });
    }

    return sock.sendMessage(from, {
      text: "⚠️ استخدم:\n.وداع شغل | وقف | حالة"
    });
  },

  init: (sock) => {
    sock.ev.on("group-participants.update", async (update) => {
      try {
        const state = loadJSON(farewellFile);
        if (!state.enabled) return;
        if (update.action !== "remove") return;

        const profiles = loadJSON(userProfileFile);

        for (const p of update.participants) {
          const jid = typeof p === "string" ? p : p.id;
          const number = jid.split("@")[0];
          const nickname = profiles[jid]?.name || "❌ غير مسجل";

          let avatar = null;
          try {
            avatar = await sock.profilePictureUrl(jid, "image");
          } catch {}

          const text = `
╔═══ ✦•💔•✦ ═══╗
      🌙 *𝑭𝑨𝑹𝑬𝑾𝑬𝑳𝑳* 🌙
╚═══ ✦•💔•✦ ═══╝

👋 *وداعًا يا* @${number}

🏷️ *اللقب :* ${nickname}

💫 كانت لحظات جميلة بوجودك معنا
نتمنى لك طريقًا مليئًا بالخير والنجاح

🌙 إلى لقاءٍ آخر
— 𝑴𝑬𝑮𝑼𝑴𝑰-𝑩𝑶𝑻
          `;

          if (avatar) {
            await sock.sendMessage(update.id, {
              image: { url: avatar },
              caption: text,
              mentions: [jid]
            });
          } else {
            await sock.sendMessage(update.id, {
              text,
              mentions: [jid]
            });
          }
        }
      } catch (e) {
        console.error("Farewell Error:", e);
      }
    });
  }
};