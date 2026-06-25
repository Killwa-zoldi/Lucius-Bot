module.exports = {
  name: "مشرفين",
  description: "عرض مشرفي القروب (عام)",

  run: async (sock, m) => {
    const from = m.key.remoteJid;

    // فقط مجموعات
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ الأمر يعمل داخل القروبات فقط." }, { quoted: m });
    }

    const metadata = await sock.groupMetadata(from);

    const admins = metadata.participants.filter(
      p => p.admin === "admin" || p.admin === "superadmin"
    );

    if (!admins.length) {
      return sock.sendMessage(from, { text: "❌ لا يوجد مشرفين." }, { quoted: m });
    }

    const list = admins
      .map((a, i) => `✦ ${i + 1} ┇ @${a.id.split("@")[0]}`)
      .join("\n");

    // ===== اقتباس وهمي (whatsapp • status رسمي) =====
    const fakeStatusQuote = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        conversation: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓"
      }
    };

    // رياكت
    await sock.sendMessage(from, {
      react: { text: "👑", key: m.key }
    });

    // إرسال القائمة
    await sock.sendMessage(
      from,
      {
        text:
`*𝗔𝗗𝗠𝗜𝗡𝗦 𝗟𝗜𝗦𝗧*

${list}

📊 العدد: ${admins.length}`,
        mentions: admins.map(a => a.id)
      },
      { quoted: fakeStatusQuote }
    );
  }
};