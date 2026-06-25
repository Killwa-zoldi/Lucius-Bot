const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../config.js");
const config = require("../config");

function saveDevelopers(list) {
    let content = fs.readFileSync(configPath, "utf8");
    const formatted = `DEVELOPERS: [\n${list.map(id => `  "${id}"`).join(",\n")}\n]`;
    content = content.replace(/DEVELOPERS\s*:\s*\[[\s\S]*?\]/, formatted);
    fs.writeFileSync(configPath, content);
    config.DEVELOPERS = list;
}

function getTarget(msg) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid?.length) return ctx.mentionedJid[0];
    if (ctx?.participant) return ctx.participant;
    return null;
}

module.exports = {
    name: "طور",
    run: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const isGroup = from.endsWith("@g.us");

        if (!config.DEVELOPERS.includes(sender)) {
            return sock.sendMessage(from, { text: "🚫 هذا الأمر للمطورين فقط." });
        }

        const action = args[0];
        let devs = [...config.DEVELOPERS];

        if (action === "عرض") {
            if (!devs.length) {
                return sock.sendMessage(from, { text: "📭 لا يوجد مطورين." });
            }
            return sock.sendMessage(from, {
                text: `👨‍💻 قائمة المطورين:\n\n${devs.map((id, i) => `${i + 1}. @${id.split("@")[0]}`).join("\n")}`,
                mentions: devs
            });
        }

        if (action === "شرف") {
            if (!isGroup) return sock.sendMessage(from, { text: "⚠️ هذا الأمر يعمل داخل القروبات فقط." });
            try {
                await sock.groupParticipantsUpdate(from, devs, "promote");
                return sock.sendMessage(from, {
                    text: `✅ تم ترقية جميع المطورين إلى مشرفين.\n👥 العدد: ${devs.length}`,
                    mentions: devs
                });
            } catch (err) {
                console.error(err);
                return sock.sendMessage(from, { text: "❌ فشل الترقية (تأكد أن البوت مشرف)." });
            }
        }

        const target = getTarget(msg);
        if (!target) return sock.sendMessage(from, { text: "⚠️ استخدم الأمر بالرد على شخص أو منشنه." });

        if (action === "رفع") {
            if (devs.includes(target)) return sock.sendMessage(from, { text: "ℹ️ هذا الشخص مطور بالفعل." });
            devs.push(target);
            saveDevelopers(devs);
            return sock.sendMessage(from, {
                text: `✅ تم رفعه إلى مطور بنجاح.\n🆔 @${target.split("@")[0]}`,
                mentions: [target]
            });
        }

        if (action === "زيل") {
            if (!devs.includes(target)) return sock.sendMessage(from, { text: "ℹ️ هذا الشخص ليس مطورًا." });
            devs = devs.filter(id => id !== target);
            saveDevelopers(devs);
            return sock.sendMessage(from, {
                text: `🗑️ تم إزالة المطور بنجاح.\n🆔 @${target.split("@")[0]}`,
                mentions: [target]
            });
        }

        return sock.sendMessage(from, {
            text: "⚠️ الأوامر:\n.طور رفع\n.طور زيل\n.طور عرض\n.طور شرف"
        });
    }
};