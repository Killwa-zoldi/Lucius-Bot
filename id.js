// commands/id.js
module.exports = {
    name: "ايدي",
    description: "يعطيك معرف الشخص/مجموعة/قناة",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        let target;

        // منشن
        if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];

        // رد على رسالة
        } else if (m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = m.message.extendedTextMessage.contextInfo.participant;

        // ".ايدي هنا" في مجموعة
        } else if (from.endsWith("@g.us") && args.join(" ").toLowerCase() === "هنا") {
            target = from;

        // رابط قناة
        } else if (args[0]?.startsWith("https://chat.whatsapp.com/")) {
            try {
                const code = args[0].split("/").pop();
                const info = await sock.groupInviteInfo(code); // يحصل على metadata
                target = info.id; // هذا JID القناة
            } catch {
                target = "❌ لم أستطع جلب إيدي القناة، تأكد من الرابط";
            }

        // الحالة الافتراضية: إيدي المرسل
        } else {
            target = m.key.participant || from;
        }

        await sock.sendMessage(from, { text: `${target}` }, { quoted: m });
    }
};
