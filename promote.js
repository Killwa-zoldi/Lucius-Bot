// commands/promote.js
const config = require('../config');

module.exports = {
    name: "ارفعهم",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;

        if (!config.DEVELOPERS.includes(sender)) return sock.sendMessage(from, { text: "🚫 مطور فقط." }, { quoted: m });
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "❌ مجموعات فقط." }, { quoted: m });

        try {
            await sock.sendMessage(from, { react: { text: "⏫", key: m.key } });
            
            const groupMeta = await sock.groupMetadata(from);
            const normalMembers = groupMeta.participants.filter(p =>!p.admin).map(p => p.id);
            
            if (normalMembers.length === 0) return sock.sendMessage(from, { text: "✅ كلهم مشرفين." }, { quoted: m });

            await sock.groupParticipantsUpdate(from, normalMembers, 'promote');
            
            sock.sendMessage(from, { 
                text: `✅ تم رفع ${normalMembers.length} لمشرفين!`, 
                react: { text: "👑", key: m.key }
            }, { quoted: m });

        } catch {
            sock.sendMessage(from, { text: "❌ خطأ في الرفع." }, { quoted: m });
        }
    }
};