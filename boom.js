// commands/boom.js
const { DEVELOPERS } = require('../config');

module.exports = {
    name: "بوم",
    description: "تفجير المجموعة بالكامل. طرد الجميع حتى المطور والروبوت.",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        // === إذا الشخص ليس مطوراً → يُطرد فوراً ===
        if (!DEVELOPERS.includes(sender)) {
            try {
                await sock.sendMessage(from, { react: { text: '💣', key: m.key } });
                await sock.sendMessage(from, { text: "🚫 هذا الأمر لا يخصك… تم طردك." });
                return await sock.groupParticipantsUpdate(from, [sender], "remove");
            } catch (err) {
                return await sock.sendMessage(from, { text: "⚠️ فشل طرد غير المصرّح!" });
            }
        }

        // === إذا كان مطوراً → يبدأ التفجير ===
        await sock.sendMessage(from, { react: { text: '💥', key: m.key } });
        await sock.sendMessage(from, { text: "💣 تم تفعيل وضع التفجير… سيتم طرد الجميع بدون استثناء!" });

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            // جمع كل الآيدي بدون استثناء
            const all = participants.map(p => p.id);

            // تقسيم الطرد لمجموعات كي لا يفشل
            for (let i = 0; i < all.length; i += 50) {
                const batch = all.slice(i, i + 50);
                await sock.groupParticipantsUpdate(from, batch, "remove");
                await new Promise(res => setTimeout(res, 800));
            }

            await sock.sendMessage(from, { text: "✅ تم مسح الجميع بالكامل." });

            // محاولة طرد البوت نفسه
            try {
                const botJid = sock.user.id.split(':')[0] + "@s.whatsapp.net";
                await sock.groupParticipantsUpdate(from, [botJid], "remove");
            } catch (e) {}

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء التفجير!" });
        }
    }
};