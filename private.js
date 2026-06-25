module.exports = {
    name: 'خاص',
    run: async (sock, m, args) => {
        const config = require('../config'); // تأكد من المسار الصحيح
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        // التحقق من المطور
        if (!config.DEVELOPERS.includes(sender)) {
            await sock.sendMessage(from, { text: config.NO_PERMISSION });
            return;
        }

        // التأكد من وجود نص أو رسالة مقتبسة
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!args.length && !quoted) {
            return await sock.sendMessage(from, { text: "⚠️ اكتب رسالة بعد الأمر أو رد على رسالة لإعادة توجيهها." }, { quoted: m });
        }

        try {
            const metadata = await sock.groupMetadata(from);

            for (let participant of metadata.participants) {
                const jid = participant.id;
                if (jid === sock.user.id) continue; // استثناء البوت نفسه

                if (args.length) {
                    // إرسال النص مباشرة
                    await sock.sendMessage(jid, { text: args.join(' ') });
                } else {
                    // إعادة توجيه الرسالة المقتبسة
                    const forwardMsg = {
                        key: {
                            remoteJid: from,
                            fromMe: false,
                            id: m.message.extendedTextMessage.contextInfo.stanzaId,
                            participant: m.message.extendedTextMessage.contextInfo.participant
                        },
                        message: quoted
                    };
                    await sock.sendMessage(jid, { forward: forwardMsg });
                }

                await new Promise(res => setTimeout(res, 100)); // منع الحظر
            }

            await sock.sendMessage(from, { text: "✅ تم إرسال الرسالة لجميع الأعضاء في الخاص." });

        } catch (err) {
            console.error("خطأ في أمر .خاص:", err);
            await sock.sendMessage(from, { text: "⚠️ حدث خطأ أثناء الإرسال للخاص." });
        }
    }
};