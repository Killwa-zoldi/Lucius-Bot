const fs = require("fs");
const path = require("path");
const config = require("../config");

const protectionFile = path.join(__dirname, "../data/protection.json");

// إنشاء ملف JSON تلقائيًا إذا غير موجود
if (!fs.existsSync(protectionFile)) {
    fs.writeFileSync(protectionFile, JSON.stringify({ enabled: false }, null, 2));
}

// دالة لتحميل حالة الحماية
function loadProtection() {
    try {
        return JSON.parse(fs.readFileSync(protectionFile, "utf8"));
    } catch (err) {
        console.error("خطأ في تحميل protection.json:", err);
        return { enabled: false };
    }
}

// دالة لحفظ حالة الحماية
function saveProtection(state) {
    fs.writeFileSync(protectionFile, JSON.stringify(state, null, 2));
}

module.exports = {
    name: "حماية",
    run: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!config.DEVELOPERS.includes(sender)) {
            return sock.sendMessage(from, { text: `🚫 ${config.NO_PERMISSION}` });
        }

        const action = args[0]; // شغل | وقف | حالة
        let protection = loadProtection();

        if (action === "شغل") {
            protection.enabled = true;
            saveProtection(protection);
            return sock.sendMessage(from, { text: "🛡️ تم تفعيل حماية الإشراف!" });
        }

        if (action === "وقف") {
            protection.enabled = false;
            saveProtection(protection);
            return sock.sendMessage(from, { text: "⚠️ تم إيقاف حماية الإشراف." });
        }

        if (action === "حالة") {
            const status = protection.enabled ? "✅ مفعلة" : "❌ مغلقة";
            return sock.sendMessage(from, { text: `حماية الإشراف حالياً: ${status}` });
        }

        return sock.sendMessage(from, { text: `⚠️ استخدم: ${config.PREFIX}حماية شغل | وقف | حالة` });
    },

    // دالة لتشغيل الحماية تلقائيًا عند تحميل البوت
    init: (sock) => {
        sock.ev.on("group-participants.update", async (update) => {
            try {
                const protection = loadProtection();
                if (!protection.enabled) return;

                const { id, participants, action, author } = update;
                if (!id || !participants || !action) return;
                if (config.DEVELOPERS.includes(author)) return;

                if (action === "promote" || action === "demote") {
                    const metadata = await sock.groupMetadata(id);
                    const admins = metadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
                    const nonDevAdmins = admins.map(a => a.id).filter(jid => !config.DEVELOPERS.includes(jid));

                    if (nonDevAdmins.length > 0) {
                        await sock.groupParticipantsUpdate(id, nonDevAdmins, "demote");
                    }

                    for (const dev of config.DEVELOPERS) {
                        const devInGroup = metadata.participants.find(p => p.id === dev);
                        if (devInGroup && !devInGroup.admin) {
                            await sock.groupParticipantsUpdate(id, [dev], "promote");
                        }
                    }

                    await sock.sendMessage(id, { text: `⚠️ تم كشف تعديل الإشراف، ${config.BOT_NAME} دائما شغال للكشف خطر.` });
                }
            } catch (err) {
                console.error("خطأ في حماية المشرفين:", err);
            }
        });
    }
};