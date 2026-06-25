module.exports = {
  name: "معرفتش",
  description: "استسلام في أي لعبة لغز",
  run: async (sock, m, args, { gameState }, jsonData, saveJSON) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    if (!gameState[from]?.active || gameState[from]?.type !== 'riddle') {
      return sock.sendMessage(from, { text: "⚠️ لا توجد لعبة جارية." });
    }

    const answer = gameState[from].answer;
    clearTimeout(gameState[from].timeout);
    gameState[from].active = false;

    await sock.sendMessage(from, {
      text: `استسلمت 😂\n📢 الإجابة الصحيحة هي: *${answer}*`
    });
  }
};
