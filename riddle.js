const riddles = [
  { q: "يمشي بلا رجلين ويدخل الأذنين؟", a: "صوت" },
  { q: "شيء لا ينكسر مهما ضربته؟", a: "ماء" },
  { q: "كلما أخذت منه كبر؟", a: "حفرة" },
  { q: "تراه ولا يراك؟", a: "مرآة" },
  { q: "يكتب ولا يقرأ؟", a: "قلم" },
  { q: "يجفف ولا يبتل؟", a: "منشفة" },
  { q: "بلا بداية ولا نهاية؟", a: "دائرة" },
  { q: "أسنان بلا عَضّ؟", a: "مشط" },
  { q: "يطير بلا جناح؟", a: "وقت" },
  { q: "عين بلا بصر؟", a: "إبرة" },
  { q: "بحر بلا ماء؟", a: "خريطة" },
  { q: "رقبة بلا رأس؟", a: "زجاجة" },
  { q: "قلب بلا نبض؟", a: "كتاب" },
  { q: "بيت بلا أبواب؟", a: "شعر" },
  { q: "يدخل ماء ولا يبتل؟", a: "ظل" },
  { q: "يتكلم كل اللغات؟", a: "صدى" }
];

module.exports = {
  name: "لغز",
  description: "لعبة الألغاز",
  run: async (sock, m, args, { gameState, bank }, jsonData, saveJSON, saveBank) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    if (gameState[from]?.active) return sock.sendMessage(from, { text: "⚠️ هناك لعبة جارية حالياً." });

    const riddle = riddles[Math.floor(Math.random() * riddles.length)];
    gameState[from] = {
      type: 'riddle',
      answer: riddle.a,
      active: true
    };

    const timeout = setTimeout(() => {
      if (gameState[from]?.active && gameState[from].type === 'riddle') {
        gameState[from].active = false;
        sock.sendMessage(from, { text: `⏰ الوقت انتهى! الإجابة الصحيحة كانت: *${riddle.a}*` });
      }
    }, 60000);

    gameState[from].timeout = timeout;

    await sock.sendMessage(from, { react: { text: "❓", key: m.key } });

    await sock.sendMessage(from, {
      text: `
╔═══ ❖•🧠•❖ ═══╗
       🤔 𝑹𝒊𝒅𝒅𝒍𝒆 𝑮𝒂𝒎𝒆
╚═══ ❖•🧠•❖ ═══╝

🕵️‍♂️ اللغز:

『 ${riddle.q} 』

🏆 أول من يجيب بشكل صحيح يفوز:
💰 *5000 درهم!* 🥳

─────────────
✨ لديك 60 ثانية للإجابة
للاستسلام: اكتب .معرفتش
`
    });
  }
};
