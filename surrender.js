module.exports = {
  name: "استسلم",
  description: "الاستسلام في لعبة احزر الأنمي والكشف عن الإجابة",
  run: async (sock, m, args, { gameState, bank }, jsonData, saveJSON, saveBank) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    if (!gameState[from]?.active || gameState[from]?.type !== "guess") {
      return sock.sendMessage(from, { text: "⚠️ لا توجد لعبة جارية." });
    }

    const correctAnswer = gameState[from].answer;

    if (gameState[from].timeout) clearTimeout(gameState[from].timeout);

    gameState[from].active = false;

    await sock.sendMessage(from, {
      text: `😅 لقد استسلمت!  
📢 الإجابة الصحيحة هي: *${correctAnswer}*`
    });
  },
};
