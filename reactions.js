const fs = require("fs");
const path = require("path");

// مسار JSON لتخزين التفاعلات
const reactionsFile = path.join(__dirname, "../data/reactions.json");

// إنشاء الملف إذا لم يكن موجود
if (!fs.existsSync(reactionsFile)) {
    fs.writeFileSync(reactionsFile, JSON.stringify({}, null, 2));
}

// تحميل التفاعلات من الملف
let reactions = {};
try {
    reactions = JSON.parse(fs.readFileSync(reactionsFile, "utf8"));
} catch (err) {
    console.error("خطأ في تحميل reactions.json:", err);
    reactions = {};
}

// تابع لحفظ الملف
function saveReactions() {
    fs.writeFileSync(reactionsFile, JSON.stringify(reactions, null, 2));
}

module.exports = {
    name: "تفاعل",
    run: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!args[0]) {
            return sock.sendMessage(from, { text: "⚠️ استخدم:\n.تفاعل [الإيموجي]\n.تفاعل الغي\n.تفاعل عرض" });
        }

        const action = args[0].toLowerCase();

        // الغي التفاعل
        if (action === "الغي") {
            if (reactions[sender]) {
                delete reactions[sender];
                saveReactions();
                return sock.sendMessage(from, { text: "✅ تم إلغاء التفاعل لك." });
            } else {
                return sock.sendMessage(from, { text: "⚠️ ليس لديك أي تفاعل مفعل." });
            }
        }

        // عرض جميع التفاعلات
        if (action === "عرض") {
            if (Object.keys(reactions).length === 0) {
                return sock.sendMessage(from, { text: "⚠️ لا توجد أي تفاعلات حالياً." });
            }

            let text = `📋 قائمة التفاعلات الحالية:\n\n`;
            for (let jid in reactions) {
                text += `👤 @${jid.split("@")[0]} → ${reactions[jid]}\n`;
            }

            return sock.sendMessage(from, { text, mentions: Object.keys(reactions) });
        }

        // تفعيل إيموجي جديد
        const emoji = args[0];
        reactions[sender] = emoji;
        saveReactions();

        return sock.sendMessage(from, { text: `✅ تم تفعيل التفاعل لك بالإيموجي: ${emoji}` });
    },

    // تابع لتطبيق التفاعل التلقائي على رسائل المستخدم
    reactMessage: async (sock, m) => {
        try {
            if (!m.message || m.key.fromMe) return;

            const from = m.key.remoteJid;
            const userId = m.key.participant || m.key.remoteJid;

            // يرسل رد فعل فقط على رسائل المستخدمين الذين فعلوا التفاعل
            if (reactions[userId]) {
                await sock.sendMessage(from, {
                    react: { text: reactions[userId], key: m.key }
                });
            }
        } catch (err) {
            console.error("خطأ في ردود الفعل التلقائية:", err);
        }
    }
};