const reward = 5000;
const timeoutMs = 30000;

const words = [
  "ناروتو","ساسكي","غوكو","لوفي","ايتشيغو","ميكاسا","ليفاي","تانجيرو","رينغوكو",
  "غوجو","ميغومي","ايرين","كانيكي","كيلوا","كورابيكا","استا","ميناتو","مادارا",
  "اوباناي","زينيتسو","اينوسكي","سايتاما","غريمجو","ايزن","يوتا","ماهوراغا"
];

const activeGames = {};

function shuffleWord(word) {
  return word.split("").sort(() => Math.random() - 0.5).join("");
}

module.exports = {
  name: "ترتيب",
  run: async (sock, msg, args, { bank }, jsonData, saveJSON) => {
    const chat = msg.key.remoteJid;

    if (activeGames[chat]) {
      return sock.sendMessage(chat, {
        text: "⚠️ توجد لعبة ترتيب نشطة حالياً!"
      }, { quoted: msg });
    }

    const answer = words[Math.floor(Math.random() * words.length)];
    let mixed = shuffleWord(answer);
    while (mixed === answer) mixed = shuffleWord(answer);

    activeGames[chat] = true;

    await sock.sendMessage(chat, {
      react: { text: "🧩", key: msg.key }
    });

    await sock.sendMessage(chat, {
      text: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
        ✦ 𝑹𝒂𝒏𝒌𝒊𝒏𝒈 𝑮𝒂𝒎𝒆 ✦
*╚═══════⊹⊱❖⊰⊹═══════╝*

🔀 رتب الكلمة التالية:

*「 ${mixed} 」*

💰 الجائزة: ${reward} درهم
⏳ الوقت: 30 ثانية

✍🏻 اكتب الكلمة الصحيحة
      `.trim()
    }, { quoted: msg });

    const timer = setTimeout(() => {
      delete activeGames[chat];
      sock.sendMessage(chat, {
        text: `⌛ انتهى الوقت!\n\n✅ الكلمة الصحيحة:\n*${answer}*`
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

      if (text.trim() !== answer) return;

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
        🏆 فائز الترتيب
*╚═══════⊹⊱❖⊰⊹═══════╝*

👤 @${sender.split("@")[0]}
✅ ترتيب صحيح
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