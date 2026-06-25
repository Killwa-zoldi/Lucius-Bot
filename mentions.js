const fs = require('fs');
const path = require('path');

const eliteFile = path.join(__dirname, '..', 'data', 'elite.json');

function getElite() {
  if (!fs.existsSync(eliteFile)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(eliteFile, 'utf8'));
    return data.elite || [];
  } catch {
    return [];
  }
}

module.exports = {
  name: "منشن",
  description: "منشن جماعي (مشرف أو نخبة)",
  async run(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: '❌ هذا الأمر يعمل في المجموعات فقط.' }, { quoted: m });
    }

    const elite = getElite();
    const meta = await sock.groupMetadata(from);
    const participants = meta.participants || [];

    const isAdmin = participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
    const isElite = elite.includes(sender);

    if (!isAdmin && !isElite) {
      return sock.sendMessage(
        from,
        { text: '`❌ هـــذا امــر لـلادمــن او نــخـــبـة فـــقـط`' },
        { quoted: m }
      );
    }

    const fakeStatusQuote = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "group@broadcast"
      },
      message: { conversation: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓" }
    };

    try {
      await sock.sendMessage(from, {
        react: { text: '📢', key: m.key }
      });
    } catch {}

    let pfp;
    try {
      pfp = await sock.profilePictureUrl(from, 'image');
    } catch {
      pfp = 'https://i.ibb.co/4Jv8QJt/default-profile.png';
    }

    const owner = meta.owner || participants.find(p => p.admin === 'superadmin')?.id || null;
    const admins = participants.filter(p => p.admin === 'admin' && p.id !== owner).map(p => p.id);
    const members = participants.filter(p => !p.admin && p.id !== owner).map(p => p.id);

    let index = 1;
    const mentions = [];
    const text = [];

    text.push(`╔══════════════════════════════════════════╗`);
    text.push(`💎👑 *مـنــشـن جـمــاعـي – ${meta.subject || 'المجموعة'}* 👑💎`);
    text.push(`╠══════════════════════════════════════════╣`);
    text.push(`👥 *عـــدد الأعــضـاء – ${participants.length}*`);
    text.push(`╚══════════════════════════════════════════╝`);
    text.push('');
    text.push(`✨ أهلاً وسهلاً بجميع أفراد المجموعة ✨`);
    text.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    if (owner) {
      text.push(`👑 *الــمــالــك*`);
      text.push(` ${index++}. @${owner.split('@')[0]}`);
      mentions.push(owner);
      text.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }

    if (admins.length) {
      text.push(`🛡️ *الـمــشــرفــون*`);
      admins.forEach(a => {
        text.push(` ${index++}. @${a.split('@')[0]}`);
        mentions.push(a);
      });
      text.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }

    if (members.length) {
      text.push(`👥 *الأعــضــاء*`);
      members.forEach(mb => {
        text.push(` ${index++}. @${mb.split('@')[0]}`);
        mentions.push(mb);
      });
    }

    text.push('');
    text.push(`👑 *تحيات 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓*`);

    await sock.sendMessage(
      from,
      {
        image: { url: pfp },
        caption: text.join('\n'),
        mentions
      },
      { quoted: fakeStatusQuote }
    );
  }
};