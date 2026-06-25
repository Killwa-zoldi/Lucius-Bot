module.exports = {
  name: "مزيد",
  description: "إرسال نص مع قراءة المزيد وخلفية status وهمية",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid

    if (!args.length) {
      return sock.sendMessage(
        from,
        { text: "⚠️ اكتب النص بعد الأمر\nمثال:\n.مزيد مرحباً بكم في ميغومي" },
        { quoted: m }
      )
    }

    const userText = args.join(" ")

    const readMore = String.fromCharCode(8206).repeat(4000)

    const text =
`*You're now a megumi*
${readMore}

${userText}`

    const fakeStatusQuote = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        conversation: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓"
      }
    }

    await sock.sendMessage(
      from,
      { text },
      { quoted: fakeStatusQuote }
    )
  }
}