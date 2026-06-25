const axios = require('axios')
const { spawn } = require("child_process")
const webp = require("node-webpmux")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
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
  img.exif = buildExif(config.BOT_NAME, "حقوق ميغومي 🤙🏻😛")
  return await img.save(null)
}

async function searchPinterest(query, limit = 5) {
  try {
    const res = await axios.get('https://blackwave-api.vercel.app/api/v1/search/pinterest', { 
      params: { query } 
    })
    if (!res.data?.status || !res.data?.pins) return []
    return res.data.pins.filter(p => p.image?.startsWith("http")).slice(0, limit)
  } catch {
    return []
  }
}

module.exports = {
  name: "ملصقات",
  description: "🔖 تحويل صور Pinterest لملصقات",
  async run(sock, m, args) {
    const from = m.key.remoteJid

    if (!args.length) {
      return sock.sendMessage(from, {
        text: "⚠️ استخدم:\n.ملصقات <الكلمة> <عدد (1-30)>"
      }, { quoted: m })
    }

    let count = parseInt(args[args.length - 1])
    if (isNaN(count)) {
      count = 1
    } else {
      if (count > 30) count = 30
      if (count < 1) count = 1
      args.pop()
    }

    const query = args.join(" ")
    if (!query) return

    await sock.sendMessage(from, { react: { text: "🖼️", key: m.key } })

    try {
      const results = await searchPinterest(query, count)
      if (!results.length) {
        return sock.sendMessage(from, { text: "❌ لم أجد صور." }, { quoted: m })
      }

      const tmp = path.join(__dirname, "../temp")
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

      for (let i = 0; i < results.length; i++) {
        const imgData = await axios.get(results[i].image, { responseType: "arraybuffer" })
        const input = path.join(tmp, `${Date.now()}_${i}.jpg`)
        const output = path.join(tmp, `${Date.now()}_${i}.webp`)

        fs.writeFileSync(input, imgData.data)

        await new Promise((resolve, reject) => {
          spawn("ffmpeg", [
            "-y",
            "-i", input,
            "-vf", "scale=512:512:force_original_aspect_ratio=decrease",
            output
          ]).on("close", code => code === 0 ? resolve() : reject())
        })

        const sticker = await addExif(fs.readFileSync(output))
        await sock.sendMessage(from, { sticker })

        fs.unlinkSync(input)
        fs.unlinkSync(output)
      }

      await sock.sendMessage(from, { react: { text: "✅", key: m.key } })

    } catch (e) {
      console.error(e)
      await sock.sendMessage(from, {
        text: "❌ حدث خطأ أثناء إنشاء الملصقات."
      }, { quoted: m })
    }
  }
}