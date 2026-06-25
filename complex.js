const fs = require("fs");
const path = require("path");
const dataDir = path.join(__dirname, "../data");
const bankFile = path.join(dataDir, "bank.json");

if (!fs.existsSync(bankFile)) fs.writeFileSync(bankFile, JSON.stringify({}, null, 2));

function loadBank() {
    try {
        return JSON.parse(fs.readFileSync(bankFile, "utf8"));
    } catch {
        return {};
    }
}

function saveBank(data) {
    fs.writeFileSync(bankFile, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "معقدة",
    run: async (sock, m, gameState) => {
        const from = m.key.remoteJid;
        const userId = m.key.participant || from;

        if (!gameState[from]?.active || gameState[from]?.type !== 'scramble') {
            return sock.sendMessage(from, { text: '⚠️ لا توجد لعبة تفكيك جارية حالياً.' });
        }

        const correctAnswer = gameState[from].answer;
        gameState[from].active = false;

        await sock.sendMessage(from, {
            text: `😅 استسلمت يا بطل!
📢 الإجابة الصحيحة للكلمة هي: *${correctAnswer}*`
        });
    }
};
