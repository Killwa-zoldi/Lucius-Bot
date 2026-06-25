const reward = 5000;
const timeoutMs = 30000;

const words = [
  "ميغومي","ناروتو","ساسكي","غوكو","لوفي",
  "ايتشيغو","كاكاشي","تانجيرو","ليفاي",
  "غوجو","ايرين","سايتاما","ميناتو","مادارا"
];

const activeGames = {};

function splitWord(word) {
  return word.split("").join(" ");
}

module.exports = {
  name: "تفكيك",
  run: async (sock, msg, args, { bank }, jsonData, saveJSON) => {
    const chat = msg.key.remoteJid;

    if (activeGames[chat]) {
      return sock.sendMessage(chat, {
        text: "⚠️ توجد لعبة تفكيك نشطة حالياً!"
      }, { quoted: msg });
    }

    const word = words[Math.floor(Math.random() * words.length)];
    const correctAnswer = splitWord(word);

    activeGames[chat] = true;

    await sock.sendMessage(chat, {
      react: { text: "🧩", key: msg.key }
    });

    await sock.sendMessage(chat, {
      text: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
        ✦ 𝑺𝒄𝒓𝒂𝒎𝒃𝒍𝒆 𝒈𝒂𝒎𝒆 ✦
*╚═══════⊹⊱❖⊰⊹═══════╝*

🔤 فكّك الكلمة التالية:

*${word}*

✍🏻 اكتب الحروف مفصولة بمسافة
💰 الجائزة: ${reward} درهم
⏳ الوقت: 30 ثانية
      `.trim()
    }, { quoted: msg });

    const timer = setTimeout(() => {
      delete activeGames[chat];
      sock.sendMessage(chat, {
        text: `⌛ انتهى الوقت!\n\n✅ التفكيك الصحيح:\n*${correctAnswer}*`
      });
      sock.ev.off("messages.upsert", handler);
    }, timeoutMs);

    const handler = async ({ messages }) => {
      const m = messages[0];
      if (!m?.message) return;
      if (m.key.remoteJid !== chat) return;

      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text;

      if (!text || !activeGames[chat]) return;

      const sender = m.key.participant || m.key.remoteJid;
      const userAnswer = text.trim().replace(/\s+/g, " ");

      if (userAnswer !== correctAnswer) return;

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
        🏆 فائز التفكيك
*╚═══════⊹⊱❖⊰⊹═══════╝*

👤 @${sender.split("@")[0]}
✅ تفكيك صحيح
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