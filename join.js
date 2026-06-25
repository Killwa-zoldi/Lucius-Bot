// commands/join.js
const config = require('../config');

module.exports = {
    name: "دخل",
    description: "انضمام سريع للمجموعة عبر رابط الدعوة",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        
        // تحويل args لـ string وتأكد من وجوده
        const inviteUrl = (args || '').toString().trim();

        if (!config.DEVELOPERS.includes(sender)) {
            return await sock.sendMessage(from, { text: "🚫 خاص بالمطور فقط." }, { quoted: m });
        }

        if (!inviteUrl ||!inviteUrl.startsWith("https://chat.whatsapp.com/")) {
            return await sock.sendMessage(from, { text: "❌ ارسل رابط مجموعة صحيح.\nمثال: https://chat.whatsapp.com/ABC123" }, { quoted: m });
        }

        try {
            await sock.sendMessage(from, { react: { text: "🔄", key: m.key } });

            const code = inviteUrl.split("/").pop();
            if (!code || code.length < 5) {
                return await sock.sendMessage(from, { text: "❌ كود الدعوة غير صحيح." }, { quoted: m });
            }

            const res = await sock.groupAcceptInvite(code);

            // التحقق من الاستجابة
            if (res && (res.status === 200 || res.gid)) {
                await sock.sendMessage(from, { text: "✅ تم الدخول للمجموعة بنجاح!" }, { quoted: m });
            } else if (res && res.status === 403) {
                await sock.sendMessage(from, { text: "📩 تم إرسال طلب الانضمام، انتظر الموافقة." }, { quoted: m });
            } else if (res && (res.status === 404 || res.status === 401)) {
                await sock.sendMessage(from, { text: "❌ الرابط غير متوفر أو منتهي الصلاحية." }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: "⚠️ حدث خطأ، جرب رابط آخر." }, { quoted: m });
            }

        } catch (error) {
            console.error('خطأ في.دخل:', error);
            
            if (error.message?.includes('404') || error.message?.includes('not_found')) {
                await sock.sendMessage(from, { text: "❌ المجموعة غير متوفرة." }, { quoted: m });
            } else if (error.message?.includes('403') || error.message?.includes('forbidden')) {
                await sock.sendMessage(from, { text: "📩 تم إرسال طلب الانضمام." }, { quoted: m });
            } else if (error.message?.includes('expired') || error.message?.includes('invalid')) {
                await sock.sendMessage(from, { text: "⏰ الرابط منتهي الصلاحية." }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: "❌ خطأ في الرابط، تأكد من صحته." }, { quoted: m });
            }
        }
    }
};