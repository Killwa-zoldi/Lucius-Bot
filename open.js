// commands/open.js
module.exports = {
    name: "فتح",
    description: "فتح المجموعة للسماح للجميع بإرسال الرسائل مع دعم الوقت",
    run: async (sock, m, args, config) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '⚠️ هذا الأمر يعمل فقط داخل المجموعات.' });

        // تحقق الصلاحيات
        const metadata = await sock.groupMetadata(from);
        const participant = metadata.participants.find(p => p.id === sender);
        const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

        if (!(isAdmin || config.ELITE.includes(sender) || sender === config.OWNER)) {
            return await sock.sendMessage(from, { text: '🚫 هذا الأمر مسموح للمشرفين، النخبة أو المطور فقط.' });
        }

        // قراءة الوقت
        const minutes = parseInt(args[0]);
        const hasTime = !isNaN(minutes) && minutes > 0;

        try {
            await sock.sendMessage(from, { react: { text: '🔓', key: m.key } });
            await sock.groupSettingUpdate(from, 'not_announcement');

            if (hasTime) {
                await sock.sendMessage(from, { text: `🔓 تم فتح المجموعة لمدة ${minutes} دقيقة.` });
                setTimeout(async () => {
                    await sock.groupSettingUpdate(from, 'announcement');
                    await sock.sendMessage(from, { text: `🔒 انتهى وقت الفتح وتم قفل المجموعة تلقائياً.` });
                }, minutes * 60 * 1000);
            } else {
                await sock.sendMessage(from, { text: '🔓 تم فتح المجموعة (يمكن للجميع إرسال الرسائل).' });
            }

        } catch (err) {
            console.error('خطأ في أمر الفتح:', err);
            await sock.sendMessage(from, { text: '❌ حدث خطأ أثناء تنفيذ الفتح.' });
        }
    }
};