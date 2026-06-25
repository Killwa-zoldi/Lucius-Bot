const fs = require('fs');
const path = require('path');

const countsPath = path.join(__dirname, '..', 'data', 'counts.json');
const eliteFile = path.join(__dirname, '..', 'data', 'elite.json');

// تحميل البيانات
let counts = fs.existsSync(countsPath) ? JSON.parse(fs.readFileSync(countsPath, 'utf8')) : {};
const ELITE = fs.existsSync(eliteFile) ? JSON.parse(fs.readFileSync(eliteFile, 'utf8')).elite || [] : {};

// حفظ البيانات مع تأخير لتجنب الكتابة المتكررة
let saveTimeout = null;
function saveCountsDebounced() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        fs.writeFileSync(countsPath, JSON.stringify(counts, null, 2));
    }, 1000);
}

// تحديث العد لكل رسالة
function trackMessage(jid, groupId, isBotLocked) {
    if (isBotLocked) return; // لا يحسب إذا البوت مقفل

    const today = new Date();
    const key = `${groupId}-${today.toDateString()}`;
    if (!counts[key]) counts[key] = {};
    if (!counts[key][jid]) counts[key][jid] = 0;
    counts[key][jid]++;
    saveCountsDebounced();
}

// إعادة ضبط يومية الساعة 00:00
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        counts = {};
        saveCountsDebounced();
        console.log("✅ تم إعادة ضبط العد اليومي للرسائل.");
    }
}, 60000);

// --- أمر .حسبة ---
module.exports = {
    name: "حسبة",
    description: "عرض إحصائيات الرسائل لكل شخص في القروب",
    run: async (sock, m, args) => {
        try {
            const from = m.key.remoteJid;
            if (!from.endsWith('@g.us')) return; // فقط مجموعات
            const sender = m.key.participant || from;

            // تحقق النخبة أو الأدمن
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
            const isAdmin = admins.includes(sender);
            const isElite = ELITE.includes(sender);
            if (!isAdmin && !isElite) {
                return sock.sendMessage(from, { text: '`❌ هـــذا امــر لـلادمــن او نــخـــبـة فـــقـط`' }, { quoted: m });
            }

            // البيانات للمجموعة واليوم
            const now = new Date();
            const key = `${from}-${now.toDateString()}`;
            const groupCounts = counts[key] || {};
            if (Object.keys(groupCounts).length === 0) {
                return sock.sendMessage(from, { text: "⚠️ لا توجد رسائل محسوبة اليوم أو البوت مقفل." }, { quoted: m });
            }

            const daysOfWeek = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            const todayName = daysOfWeek[now.getDay()];
            const timeNow = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const dateNow = now.toLocaleDateString('en-GB');

            // ترتيب الأعضاء من الأكثر رسائلًا إلى الأقل
            const sortedUsers = Object.entries(groupCounts).sort((a, b) => b[1] - a[1]);

            let listText = '';
            let idx = 1;
            const mentions = [];
            for (let [jid, count] of sortedUsers) {
                mentions.push(jid);
                
                listText += `${idx}- @${jid.split('@')[0]}  → ${count} رسالة${count>1?'📨':'📩'}\n`;
                idx++;
            }

            const messageText = `
*╔═══════⊹⊱❖⊰⊹════════╗*  
       ˼👋🏻˹ *✦ مـرحـبـاً بـك/ي @${sender.split('@')[0]} ✦*  
*╚════════⊹⊱❖⊰⊹═══════╝*

> *✦˼🪪˹↜ مـعـلـومـات اليوم ↶*  
*╭────────⊹⊱❖⊰⊹───────╮*  
*┃ ˼📆˹ اليوم : ⟪ ${todayName} ⟫*  
*┃ ˼📅˹ التاريخ : ⟪ ${dateNow} ⟫*  
*┃ ˼⏰˹ الوقت : ⟪ ${timeNow} ⟫*  
*╰────────⊹⊱❖⊰⊹───────╯*

> *✦˼👥˹↜ قائمة الرسائل ↶*  
*╭────────⊹⊱❖⊰⊹───────╮*
${listText}
*╰────────⊹⊱❖⊰⊹───────╯*

> ✅ تم الطلب من: @${sender.split('@')[0]}
> ⚠️ البوت لا يحسب الرسائل عند كونه مقفل.

> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓
            `;

            await sock.sendMessage(from, { text: messageText, mentions }, { quoted: m });

        } catch (err) {
            console.error("❌ خطأ في أمر .حسبة:", err);
            await sock.sendMessage(from, { text: '⚠️ حدث خطأ أثناء حساب الرسائل.' }, { quoted: m });
        }
    },

    // --- تحديث الرسائل لكل رسالة ---
    trackMessage
};