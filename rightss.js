const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const webp = require("node-webpmux");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("child_process");
const config = require("../config");

function stickerID() {
  return crypto.randomBytes(16).toString("hex");
}

function buildExif(pack, author) {
  const json = {
    "sticker-pack-id": stickerID(),
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author
  };
  const data = Buffer.from(JSON.stringify(json));
  const exif = Buffer.concat([
    Buffer.from([
      0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
      0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
      0x00,0x00,0x16,0x00,0x00,0x00
    ]),
    data
  ]);
  exif.writeUIntLE(data.length, 14, 4);
  return exif;
}

async function addExif(buffer, pack, author) {
  const img = new webp.Image();
  await img.load(buffer);
  img.exif = buildExif(pack, author);
  return await img.save(null);
}

module.exports = {
  name: "حقوق",
  description: "تحويل صورة، فيديو قصير أو ملصق إلى ملصق جديد بحقوق مخصصة",
  async run(sock, m, args) {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) return sock.sendMessage(from, { text: "⚠️ رد على صورة، فيديو قصير أو ملصق." }, { quoted: m });

    const text = args.join(" ") || "ميغومي"; // النص بعد الأمر Pack Name

    // تحديد نوع الرسالة
    let type = null;
    if (quoted.imageMessage) type = "image";
    else if (quoted.videoMessage) type = "video";
    else if (quoted.stickerMessage) type = "sticker";
    else return sock.sendMessage(from, { text: "⚠️ الرد يجب أن يكون على صورة، فيديو قصير أو ملصق." }, { quoted: m });

    if (type === "video" && quoted.videoMessage.seconds > 5)
      return sock.sendMessage(from, { text: "❌ الحد الأقصى للفيديو 5 ثوانٍ." }, { quoted: m });

    const stream = await downloadContentFromMessage(quoted[type + "Message"], type);
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const tmp = path.join(__dirname, "../temp");
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

    const input = path.join(tmp, `${Date.now()}.${type === "image" ? "jpg" : type === "video" ? "mp4" : "webp"}`);
    const output = path.join(tmp, `${Date.now()}.webp`);
    fs.writeFileSync(input, buffer);

    // إذا كان الملصق أصلاً فلا حاجة لتحويل، وإلا حول الصورة أو الفيديو
    if (type !== "sticker") {
      await new Promise((resolve, reject) => {
        ffmpeg.exec(
          `ffmpeg -y -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -ss 0 -t 5 -preset default -an -vsync 0 ${output}`,
          err => (err ? reject(err) : resolve())
        );
      });
      buffer = fs.readFileSync(output);
    }

    const sticker = await addExif(buffer, text, `${config.BOT_NAME}-𝑩𝑶𝑻`);
    await sock.sendMessage(from, { sticker }, { quoted: m });

    // تنظيف الملفات المؤقتة
    if (fs.existsSync(input)) fs.unlinkSync(input);
    if (fs.existsSync(output)) fs.unlinkSync(output);
  }
};