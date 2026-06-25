module.exports = {
  name: "نسبة",
  description: "نسبة حب / تفاهم / جمال / ذكاء",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    const type = args[0];
    if (!type) {
      return sock.sendMessage(from, {
        text: "⚠️ استخدم:\n.نسبة حب\n.نسبة تفاهم\n.نسبة جمال\n.نسبة ذكاء"
      }, { quoted: m });
    }

    const validTypes = ["حب", "تفاهم", "جمال", "ذكاء"];
    if (!validTypes.includes(type)) {
      return sock.sendMessage(from, { text: "❌ نوع النسبة غير معروف." }, { quoted: m });
    }

    // الهدف (منشن / رد / نفس الشخص)
    const target =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.participant ||
      sender;

    const targetNum = target.split("@")[0];
    const senderNum = sender.split("@")[0];

    // نسبة عشوائية
    const finalPercent = Math.floor(Math.random() * 101);
    let current = 0;

    const titles = {
      حب: "❤️ نسبة الحب",
      تفاهم: "🤝 نسبة التفاهم",
      جمال: "✨ نسبة الجمال",
      ذكاء: "🧠 نسبة الذكاء"
    };

    const comments = percent => {
      if (percent < 25) return "😅 النسبة ضعيفة شوي";
      if (percent < 50) return "🙂 مقبولة";
      if (percent < 75) return "🔥 نسبة قوية!";
      return "💎 أسطورية جدًا!";
    };

    // رسالة البداية
    let sent = await sock.sendMessage(from, {
      text: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
   *${titles[type]}*
*╚═══════⊹⊱❖⊰⊹═══════╝*

👤 من: @${senderNum}
🎯 إلى: @${targetNum}

⏳ جاري الحساب...
█▒▒▒▒▒▒▒▒▒▒ 0%

> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓
      `,
      mentions: [sender, target]
    }, { quoted: m });

    // العداد
    const interval = setInterval(async () => {
      current += 5;
      if (current >= finalPercent) current = finalPercent;

      const barLength = 10;
      const filled = Math.round((current / 100) * barLength);
      const bar = "█".repeat(filled) + "▒".repeat(barLength - filled);

      await sock.sendMessage(from, {
        edit: sent.key,
        text: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
   *${titles[type]}*
*╚═══════⊹⊱❖⊰⊹═══════╝*

👤 من: @${senderNum}
🎯 إلى: @${targetNum}

${bar} ${current}%
💬 ${comments(current)}

> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓
        `,
        mentions: [sender, target]
      });

      if (current >= finalPercent) {
        clearInterval(interval);
      }
    }, 1000);
  }
};