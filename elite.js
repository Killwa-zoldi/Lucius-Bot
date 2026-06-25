// commands/elite.js
const fs = require('fs');
const path = require('path');
const eliteFile = path.join(__dirname, '..', 'data', 'elite.json');

// قراءة النخبة مباشرة من الملف
function getElite() {
    if (!fs.existsSync(eliteFile)) return [];
    try {
        const data = JSON.parse(fs.readFileSync(eliteFile, 'utf8'));
        return data.elite || [];
    } catch (err) {
        console.error('خطأ في تحميل elite.json:', err);
        return [];
    }
}

// حفظ النخبة
function saveElite(eliteList) {
    fs.writeFileSync(eliteFile, JSON.stringify({ elite: eliteList }, null, 2));
}

module.exports = {
    name: "نخبة",
    description: "إدارة النخبة (رفع | زيل | عرض | شرف)",
    run: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const { DEVELOPERS } = require('../config');

        if (!DEVELOPERS.includes(sender)) {
            return await sock.sendMessage(from, { text: '🚫 هذا الأمر للمطور فقط.' }, { quoted: m });
        }

        const subCmd = args[0]?.toLowerCase();
        let ELITE = getElite(); // قراءة النخبة محدثة

        switch (subCmd) {
            case 'رفع': {
                const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                               m.message.extendedTextMessage?.contextInfo?.participant;
                if (!target) return sock.sendMessage(from, { text: '⚠️ منشن أو رد على الشخص للرفع.' }, { quoted: m });

                if (!ELITE.includes(target)) {
                    ELITE.push(target);
                    saveElite(ELITE);
                    await sock.sendMessage(from, { text: `✅ تم إضافة @${target.split('@')[0]} للنخبة.`, mentions: [target] });
                } else {
                    await sock.sendMessage(from, { text: '⚠️ هذا الشخص بالفعل في النخبة.', mentions: [target] });
                }
                break;
            }

            case 'زيل': {
                const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                               m.message.extendedTextMessage?.contextInfo?.participant;
                if (!target || !ELITE.includes(target)) return sock.sendMessage(from, { text: '⚠️ هذا الشخص ليس في النخبة.', mentions: [target] });

                ELITE = ELITE.filter(jid => jid !== target);
                saveElite(ELITE);
                await sock.sendMessage(from, { text: `✅ تم إزالة @${target.split('@')[0]} من النخبة.`, mentions: [target] });
                break;
            }

            case 'عرض': {
                if (!ELITE.length) return sock.sendMessage(from, { text: '⚠️ لا يوجد أي عضو في النخبة.' });
                await sock.sendMessage(from, { text: `📋 قائمة النخبة:\n${ELITE.map(j => `@${j.split('@')[0]}`).join('\n')}`, mentions: ELITE });
                break;
            }

            case 'شرف': {
                if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '⚠️ هذا الأمر يعمل داخل المجموعات فقط.' });

                const metadata = await sock.groupMetadata(from);
                const groupMembers = metadata.participants.map(p => p.id);

                // فلترة أعضاء النخبة: فقط من ليس مشرف أو مالك
                const eliteInGroup = ELITE.filter(jid => {
                    const member = metadata.participants.find(p => p.id === jid);
                    return member && !member.admin && jid !== metadata.owner;
                });

                if (!eliteInGroup.length) return sock.sendMessage(from, { text: '⚠️ لا يوجد نخبة صالحة للترقية في هذه المجموعة.' });

                await sock.groupParticipantsUpdate(from, eliteInGroup, 'promote');
                await sock.sendMessage(from, { 
                    text: `✅ تم رفع أعضاء النخبة للمشرفين:\n${eliteInGroup.map(j => `@${j.split('@')[0]}`).join('\n')}`, 
                    mentions: eliteInGroup 
                });
                break;
            }

            default:
                await sock.sendMessage(from, { text: '⚠️ الصيغة غير صحيحة. استخدم: نخبة رفع | زيل | عرض | شرف' });
        }
    }
};