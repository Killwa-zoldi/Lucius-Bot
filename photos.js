const axios = require('axios')
const fs = require("fs")
const path = require("path")
const config = require("../config")

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
  name: "فوتو",
  description: "🖼️ جلب صور من Pinterest مباشرة مع كابشن",
  async run(sock, m, args) {
    const from = m.key.remoteJid

    if (!args.length) {
      return sock.sendMessage(from, {
        text: "⚠️ استخدم:\n.صور <الكلمة> <عدد (1-10)>"
      }, { quoted: m })
    }

    let count = parseInt(args[args.length - 1])
    if (isNaN(count)) {
      count = 1
    } else {
      if (count > 10) count = 10
      if (count < 1) count = 1
      args.pop()
    }

    const query = args.join(" ")
    if (!query) return

    // تفاعل انتظار
    await sock.sendMessage(from, { react: { text: "🔎", key: m.key } })
    await sock.sendMessage(from, { text: `> ⏳ جاري البحث عن الصور لكلمة: *${query}* ...` }, { quoted: m })

    try {
      const results = await searchPinterest(query, count)
      if (!results.length) {
        return sock.sendMessage(from, { text: "❌ لم أجد صور." }, { quoted: m })
      }

      for (let i = 0; i < results.length; i++) {
        await sock.sendMessage(from, {
          image: { url: results[i].image },
          caption:
`*🖼️ الصـــورة ${i + 1}*

> 𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓`
        })

        // فاصل بسيط لتجنب أي ضغط على البوت
        await new Promise(r => setTimeout(r, 500))
      }

      await sock.sendMessage(from, { react: { text: "✅", key: m.key } })

    } catch (e) {
      console.error(e)
      await sock.sendMessage(from, {
        text: "❌ حدث خطأ أثناء جلب الصور."
      }, { quoted: m })
    }
  }
}