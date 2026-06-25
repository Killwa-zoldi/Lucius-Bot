// commands/directlink.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const FormData = require("form-data");

module.exports = {
  name: "رابط",
  description: "تحويل صورة أو فيديو إلى رابط مباشر عند الرد عليه",
  run: async (sock, m) => {
    const from = m.key.remoteJid;
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
      return sock.sendMessage(from, { text: "⚠️ الرجاء الرد على صورة أو فيديو لتحويله إلى رابط مباشر." }, { quoted: m });
    }

    let mediaMessage, ext;
    if (quoted.imageMessage) { mediaMessage = quoted.imageMessage; ext = ".jpg"; }
    else if (quoted.videoMessage) { mediaMessage = quoted.videoMessage; ext = ".mp4"; }
    else return sock.sendMessage(from, { text: "⚠️ الوسائط المدعومة فقط: صورة أو فيديو." }, { quoted: m });

    try {
      const stream = await downloadContentFromMessage(mediaMessage, mediaMessage.mimetype.split("/")[1]);
      let buffer = Buffer.from([]); // يجب أن يكون let
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const tmpPath = path.join(__dirname, `../data/tmp${Date.now()}${ext}`);
      fs.writeFileSync(tmpPath, buffer);

      const formData = new FormData();
      formData.append("file", fs.createReadStream(tmpPath));

      const uploadResp = await axios.post("https://file.io/?expires=1w", formData, {
        headers: formData.getHeaders()
      });

      fs.unlinkSync(tmpPath);

      if (uploadResp.data && uploadResp.data.link) {
        await sock.sendMessage(from, { text: `🔗 الرابط المباشر:\n${uploadResp.data.link}` }, { quoted: m });
      } else {
        throw new Error("فشل رفع الملف");
      }

    } catch (err) {
      console.error("خطأ في أمر .رابط:", err);
      await sock.sendMessage(from, { text: "⚠️ حدث خطأ أثناء تحويل الوسائط إلى رابط." }, { quoted: m });
    }
  }
};