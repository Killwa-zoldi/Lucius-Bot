// commands/demote.js
const config = require('../config');

module.exports = {
    name: "انزلهم",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        if (!config.DEVELOPERS.includes(sender)) return sock.sendMessage(from, { text: "🚫 مطور فقط." }, { quoted: m });
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "❌ مجموعات فقط." }, { quoted: m });

        try {
            const metadata = await sock.groupMetadata(from);
            
            // فلترة سريعة
            const admins = metadata.participants.filter(p => 
                p.admin && 
                p.admin!== 'superadmin' && 
                p.id!== sender && 
                p.id!== sock.user.id &&!config.DEVELOPERS.includes(p.id)
            ).map(p => p.id);
            
            if (admins.length === 0) return sock.sendMessage(from, { text: "✅ لا مشرفين للإنزال." }, { quoted: m });

            // إنزال كلهم دفعة واحدة (أسرع!)
            await sock.groupParticipantsUpdate(from, admins, "demote");
            
            sock.sendMessage(from, { 
                text: `✅ تم إنزال ${admins.length} مشرف! 👑`, 
                react: { text: "👤", key: m.key }
            }, { quoted: m });

        } catch {
            sock.sendMessage(from, { text: "❌ خطأ في الإنزال." }, { quoted: m });
        }
    }
};