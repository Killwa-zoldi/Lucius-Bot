const fs = require("fs");
const path = require("path");
const config = require("../config");

const MONITOR_FILE = path.join(__dirname, "..", "data", "monitor.json");

// تحميل حالة المراقبة
let monitorData = {};
if (fs.existsSync(MONITOR_FILE)) {
    try {
        monitorData = JSON.parse(fs.readFileSync(MONITOR_FILE, "utf8"));
    } catch {
        monitorData = {};
    }
}

function saveMonitor() {
    fs.writeFileSync(MONITOR_FILE, JSON.stringify(monitorData, null, 2));
}

module.exports = {
    name: "مراقبة",
    description: "تشغيل/إيقاف/حالة مراقبة الإشراف على المجموعة",
    run: async (sock, m, args, extra, jsonData, saveJSON) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        if (!config.DEVELOPERS.includes(sender)) {
            return sock.sendMessage(from, { text: "🚫 هذا الأمر للمطورين فقط." }, { quoted: m });
        }

        const action = args[0]?.toLowerCase();
        if (!action || !["شغل", "وقف", "حالة"].includes(action)) {
            return sock.sendMessage(from, { 
                text: "⚠️ استخدم: .مراقبة شغل | .مراقبة وقف | .مراقبة حالة" 
            }, { quoted: m });
        }

        // تشغيل المراقبة
        if (action === "شغل") {
            monitorData[from] = true;
            saveMonitor();
            return sock.sendMessage(from, { 
                text: `✅ تم تفعيل مراقبة الإشراف لهذه المجموعة بواسطة *${config.BOT_NAME}*` 
            }, { quoted: m });
        }

        // إيقاف المراقبة
        if (action === "وقف") {
            monitorData[from] = false;
            saveMonitor();
            return sock.sendMessage(from, { 
                text: `🛑 تم إيقاف مراقبة الإشراف لهذه المجموعة بواسطة *${config.BOT_NAME}*` 
            }, { quoted: m });
        }

        // حالة المراقبة
        if (action === "حالة") {
            const status = monitorData[from] ? "✅ مفعل" : "❌ متوقف";
            return sock.sendMessage(from, { 
                text: `📊 حالة مراقبة الإشراف لهذه المجموعة: ${status}` 
            }, { quoted: m });
        }
    }
};

// دالة يجب إضافتها داخل event الرسائل لمراقبة ترقيات/تخفيضات المشرفين
async function handleAdminUpdate(sock, groupId, participants, author) {
    try {
        if (!monitorData[groupId]) return; // إذا المراقبة متوقفة لا تعمل

        const usernames = participants.map(jid => `@${jid.split("@")[0]}`);
        const authorName = author ? `@${author.split("@")[0]}` : "النظام";

        const message = 
            `『 *مراقبة الإشراف* ┇⚜』\n` +
            `✽ ━─╌ •⤣⚜⤤• ╌─━ ✽\n\n` +
            `*👥 المستخدم${participants.length > 1 ? "ين" : ""} المتغير إشرافه:*\n` +
            `${usernames.map(name => `• ${name}`).join("\n")}\n\n` +
            `*👑 بواسطة:* ${authorName}\n` +
            `*📅 التاريخ:* ${new Date().toLocaleString()}\n` +
            `✽ ━─╌ •⤣⚜⤤• ╌─━ ✽`;

        await sock.sendMessage(groupId, { text: message, mentions: [...participants, author].filter(Boolean) });
    } catch (err) {
        console.error("❌ خطأ في مراقبة الإشراف:", err);
    }
}

module.exports.handleAdminUpdate = handleAdminUpdate;