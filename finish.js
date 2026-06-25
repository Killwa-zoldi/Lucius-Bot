// commands/Finish.js
const { DEVELOPERS } = require('../config');

module.exports = {
    name: "فنش",
    description: "طرد جميع الأعضاء غير المطورين (خاص بالمطور فقط)",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // تحقق من المطور
        if (!DEVELOPERS.includes(sender)) {
            return await sock.sendMessage(from, { text: '🚫 هذا الأمر للمطور فقط.' });
        }

        // 🍇 رياكشن
        await sock.sendMessage(from, { react: { text: '⚡', key: m.key } });

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            // تحديد من سيتم طرده
            const toRemove = participants
                .filter(p => p.id !== botJid && !DEVELOPERS.includes(p.id))
                .map(p => p.id);

            if (toRemove.length > 0) {
                // رسالة قبل الطرد
                await sock.sendMessage(from, { text: `🚪 جـاهـزوا! سيتم طرد ${toRemove.length} عضو.` });

                // الطرد على دفعات (للتقليل من الأخطاء)
                for (let i = 0; i < toRemove.length; i += 100) {
                    const batch = toRemove.slice(i, i + 100);
                    await sock.groupParticipantsUpdate(from, batch, 'remove');
                    await new Promise(res => setTimeout(res, 1000));
                }

                await sock.sendMessage(from, { text: `✅ تم طرد ${toRemove.length} عضو غير مصرح لهم.` });
            } else {
                await sock.sendMessage(from, { text: '⚠️ لا يوجد أعضاء ليتم طردهم!' });
            }

        } catch (error) {
            console.error('❌ خطأ أثناء تنفيذ أمر .فنش:', error);
            await sock.sendMessage(from, { text: '⚠️ حدث خطأ أثناء محاولة تنفيذ الأمر!' });
        }
    }
};