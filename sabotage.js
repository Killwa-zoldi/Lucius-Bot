const fs = require("fs");
const path = require("path");
const { DEVELOPERS } = require("../config");
const { exec } = require("child_process");

module.exports = {
  name: "يوو",
  description: "زرف كامل + طرد (مطور فقط)",

  run: async (sock, m) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    if (!DEVELOPERS.includes(sender)) {
      return sock.sendMessage(from, { text: "🚫 الأمر للمطور فقط." }, { quoted: m });
    }

    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ يعمل في المجموعات فقط." }, { quoted: m });
    }

    const zarfPath = path.join(__dirname, "../data/zarf.json");
    if (!fs.existsSync(zarfPath)) {
      return sock.sendMessage(from, { text: "❌ ملف zarf.json غير موجود." }, { quoted: m });
    }

    const zarf = JSON.parse(fs.readFileSync(zarfPath, "utf8"));

    // 🔥 رياكت
    if (zarf.react) {
      try {
        await sock.sendMessage(from, {
          react: { text: zarf.react, key: m.key }
        });
      } catch {}
    }

    let metadata;
    try {
      metadata = await sock.groupMetadata(from);
    } catch {
      metadata = null;
    }

    const members = metadata?.participants?.map(p => p.id) || [];

    // 1️⃣ سحب الإشراف
    if (metadata) {
      const admins = metadata.participants.filter(
        p => p.admin === "admin" || p.admin === "superadmin"
      );

      for (const admin of admins) {
        try {
          if (DEVELOPERS.includes(admin.id) || admin.id === sock.user.id) continue;
          await sock.groupParticipantsUpdate(from, [admin.id], "demote");
        } catch {}
      }
    }

    // 2️⃣ قفل المجموعة
    try {
      await sock.groupSettingUpdate(from, "announcement");
    } catch {}

    // 3️⃣ الاسم
    if (zarf.name) {
      try {
        await sock.groupUpdateSubject(from, zarf.name);
      } catch {}
    }

    // 4️⃣ الوصف
    if (zarf.description) {
      try {
        await sock.groupUpdateDescription(from, zarf.description);
        await sock.sendMessage(from, { text: `📌 ${zarf.description}` });
      } catch {}
    }

    // 5️⃣ الصورة
    if (zarf.image && fs.existsSync(zarf.image)) {
      try {
        const img = fs.readFileSync(zarf.image);
        await sock.updateProfilePicture(from, img);
      } catch {}
    }

    // 6️⃣ الصوت (مع تحويل)
    if (zarf.voice && fs.existsSync(zarf.voice)) {
      try {
        const temp = path.join(__dirname, "../data/temp_voice.mp3");

        await new Promise((res, rej) => {
          exec(
            `ffmpeg -y -i "${zarf.voice}" -ar 16000 -ac 1 -b:a 64k "${temp}"`,
            err => (err ? rej(err) : res())
          );
        });

        const audio = fs.readFileSync(temp);
        await sock.sendMessage(from, {
          audio,
          mimetype: "audio/mp4",
          ptt: false
        });

        fs.unlinkSync(temp);
      } catch {}
    }

    // 9️⃣ منشن
    if (zarf.mention && members.length) {
      try {
        await sock.sendMessage(from, {
          text: zarf.mention,
          mentions: members
        });
      } catch {}
    }

    // 7️⃣ تجهيز الطرد
    const targets = members.filter(
      jid => !DEVELOPERS.includes(jid) && jid !== sock.user.id
    );

    // رسالة قبل الطرد
    try {
      await sock.sendMessage(from, {
        text: `🚨 *جارٍ طرد ${targets.length} عضو من المجموعة...*`
      });
    } catch {}

    // 8️⃣ الطرد
    try {
      if (targets.length) {
        await sock.groupParticipantsUpdate(from, targets, "remove");
      }
    } catch {}
  }
};