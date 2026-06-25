const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const crypto = require('crypto');
const webp = require('node-webpmux');
const config = require('../config');

function generateStickerID() {
  return crypto.randomBytes(16).toString('hex');
}

function buildExif(pack, auth) {
  const json = {
    "sticker-pack-id": generateStickerID(),
    "sticker-pack-name": pack,
    "sticker-pack-publisher": auth
  };

  const exifAttr = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([
    Buffer.from([
      0x49, 0x49, 0x2A, 0x00,
      0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00,
      0x00, 0x00
    ]),
    exifAttr
  ]);

  exif.writeUIntLE(exifAttr.length, 14, 4);
  return exif;
}

async function addExifToSticker(stickerBuffer, pack, author) {
  const img = new webp.Image();
  await img.load(stickerBuffer);
  img.exif = buildExif(pack, author);
  return await img.save(null);
}

module.exports = {
  name: "حقي",
  description: "إضافة حقوق البوت على الملصق",
  category: "تحشيش",

  run: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted || !quoted.stickerMessage) {
        return sock.sendMessage(jid, { text: "❌ أرسل الأمر على ملصق!" }, { quoted: msg });
      }

      let stickerBuffer = Buffer.concat([]);
      const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
      for await (const chunk of stream) {
        stickerBuffer = Buffer.concat([stickerBuffer, chunk]);
      }

      if (!stickerBuffer.length) {
        return sock.sendMessage(jid, { text: "⚠️ لم أتمكن من قراءة الملصق!" }, { quoted: msg });
      }

      const finalSticker = await addExifToSticker(stickerBuffer, config.BOT_NAME, "حقوق ميغومي 😛🤙🏻");

      await sock.sendMessage(jid, { sticker: finalSticker }, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر .حقي:", err);
      await sock.sendMessage(jid, { text: "⚠️ حدث خطأ أثناء إضافة الحقوق!" }, { quoted: msg });
    }
  }
};