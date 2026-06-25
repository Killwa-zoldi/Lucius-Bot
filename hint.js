module.exports = {
  name: "تلميح",
  description: "إظهار تلميح للعبة احزر الأنمي",
  run: async (sock, m, args, { gameState }, jsonData, saveJSON) => {
    const from = m.key.remoteJid;

    if (!gameState[from]?.active || gameState[from]?.type !== "guess") {
      return sock.sendMessage(from, { text: "⚠️ لا توجد لعبة احزر جارية." });
    }

    await sock.sendMessage(from, {
      text: `💡 التلميح: ${gameState[from].hint}`,
    });
  },
};
