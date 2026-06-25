const reward = 5000;
const timeoutMs = 30000;

const activeGames = {};

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "رياضيات",
  run: async (sock, msg, args, { bank }, jsonData, saveJSON) => {
    const chat = msg.key.remoteJid;

    if (activeGames[chat]) {
      return sock.sendMessage(chat, {
        text: "⚠️ توجد لعبة رياضيات نشطة حالياً!"
      }, { quoted: msg });
    }

    const a = random(1, 200);
    let b = random(1, 200);

    const ops = ["+", "-", "×", "÷"];
    const op = ops[Math.floor(Math.random() * ops.length)];

    if (op === "÷") {
      b = random(1, 20);
    }

    let answer;
    switch (op) {
      case "+": answer = a + b; break;
      case "-": answer = a - b; break;
      case "×": answer = a * b; break;
      case "÷": answer = Number((a / b).toFixed(2)); break;
    }

    activeGames[chat] = true;

    await sock.sendMessage(chat, {
      react: { text: "🧮", key: msg.key }
    });

    await sock.sendMessage(chat, {
      text: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
        ✦ 𝑴𝒂𝒕𝒉 𝑮𝒂𝒎𝒆 ✦
*╚═══════⊹⊱❖⊰⊹═══════╝*

🧠 احسب العملية التالية:

*${a} ${op} ${b} = ؟*

💰 الجائزة: ${reward} درهم
⏳ الوقت: 30 ثانية

✍🏻 اكتب الناتج الصحيح
${op === "÷" ? "📌 ملاحظة: اكتب الناتج برقمين عشريين" : ""}
      `.trim()
    }, { quoted: msg });

    const timer = setTimeout(() => {
      delete activeGames[chat];
      sock.sendMessage(chat, {
        text: `⌛ انتهى الوقت!\n\n✅ الجواب الصحيح:\n*${answer}*`
      });
      sock.ev.off("messages.upsert", handler);
    }, timeoutMs);

    const handler = async ({ messages }) => {
      const m = messages[0];
      if (!m?.message) return;

      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text;

      if (!text || !activeGames[chat]) return;
      if (m.key.remoteJid !== chat) return;

      const sender = m.key.participant || m.key.remoteJid;

      const userAnswer = Number(text.trim());
      if (isNaN(userAnswer)) return;

      if (userAnswer !== answer) return;

      clearTimeout(timer);
      delete activeGames[chat];

      if (!jsonData.bank[sender]) {
        jsonData.bank[sender] = { money: 0 };
      }

      jsonData.bank[sender].money += reward;
      saveJSON("bank");

      await sock.sendMessage(chat, {
        text: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
        🏆 فائز الرياضيات
*╚═══════⊹⊱❖⊰⊹═══════╝*

👤 @${sender.split("@")[0]}
✅ إجابة صحيحة
💰 +${reward} درهم
💼 رصيدك: ${jsonData.bank[sender].money}
        `.trim(),
        mentions: [sender]
      }, { quoted: m });

      sock.ev.off("messages.upsert", handler);
    };

    sock.ev.on("messages.upsert", handler);
  }
};