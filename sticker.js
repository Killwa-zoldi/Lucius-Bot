const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const webp = require("node-webpmux")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("child_process")
const config = require("../config")

function stickerID() {
  return crypto.randomBytes(16).toString("hex")
}

function buildExif(pack, author) {
  const json = {
    "sticker-pack-id": stickerID(),
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author
  }

  const data = Buffer.from(JSON.stringify(json))
  const exif = Buffer.concat([
    Buffer.from([
      0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
      0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
      0x00,0x00,0x16,0x00,0x00,0x00
    ]),
    data
  ])

  exif.writeUIntLE(data.length, 14, 4)
  return exif
}

async function addExif(buffer) {
  const img = new webp.Image()
  await img.load(buffer)
  img.exif = buildExif(config.BOT_NAME, "حقوق ميغومي 😛🤙🏻")
  return await img.save(null)
}

module.exports = {
  name: "ملصق",
  description: "تحويل صورة أو فيديو قصير إلى ملصق بحقوق البوت",
  async run(sock, m) {
    const from = m.key.remoteJid
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message

    const type =
      quoted?.imageMessage
        ? "image"
        : quoted?.videoMessage
        ? "video"
        : null

    if (!type) return

    if (type === "video" && quoted.videoMessage.seconds > 5) return

    const stream = await downloadContentFromMessage(
      quoted[type + "Message"],
      type
    )

    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    const tmp = path.join(__dirname, "../temp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

    const input = path.join(tmp, `${Date.now()}.${type === "image" ? "jpg" : "mp4"}`)
    const output = path.join(tmp, `${Date.now()}.webp`)
    fs.writeFileSync(input, buffer)

    await new Promise((resolve, reject) => {
      ffmpeg.exec(
        `ffmpeg -y -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -ss 0 -t 5 -preset default -an -vsync 0 ${output}`,
        err => (err ? reject(err) : resolve())
      )
    })

    const sticker = await addExif(fs.readFileSync(output))
    await sock.sendMessage(from, { sticker })

    fs.unlinkSync(input)
    fs.unlinkSync(output)
  }
}