// commands/lock.js
module.exports = {
    name: "قفل",
    description: "قفل المجموعة للرسائل للمشرفين فقط مع دعم الوقت",
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
            await sock.sendMessage(from, { react: { text: '🔒', key: m.key } });
            await sock.groupSettingUpdate(from, 'announcement');

            if (hasTime) {
                await sock.sendMessage(from, { text: `🔒 تم قفل المجموعة لمدة ${minutes} دقيقة.` });
                setTimeout(async () => {
                    await sock.groupSettingUpdate(from, 'not_announcement');
                    await sock.sendMessage(from, { text: `🔓 انتهى وقت القفل وتم فتح المجموعة تلقائياً.` });
                }, minutes * 60 * 1000);
            } else {
                await sock.sendMessage(from, { text: '🔒 تم قفل المجموعة (الرسائل للمشرفين فقط).' });
            }

        } catch (err) {
            console.error('خطأ في أمر القفل:', err);
            await sock.sendMessage(from, { text: '❌ حدث خطأ أثناء تنفيذ القفل.' });
        }
    }
};