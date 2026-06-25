const { generateWAMessageFromContent } = require('@whiskeysockets/baileys')

module.exports = {
  name: "menu",
  description: "قائمة الأوامر بالأزرار",

  run: async (sock, m) => {
    const from = m.key.remoteJid

    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🎵 الأغاني",
          id: ".غنيه"
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "👮 الإدارة",
          id: ".ادمن"
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🎮 الألعاب",
          id: ".العاب"
        })
      }
    ]

    const msg = generateWAMessageFromContent(
      from,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: {
                text: "╔═══════⊹⊱❖⊰⊹═══════╗\n" +
                      "   ✦ مرحباً بك في MEGUMI ✦\n" +
                      "╚═══════⊹⊱❖⊰⊹═══════╝\n\n" +
                      "اختر القسم الذي تريده:"
              },
              footer: {
                text: "𝐌𝐄𝐆𝐔𝐌𝐈-𝐁𝐎𝐓"
              },
              nativeFlowMessage: {
                buttons,
                messageParamsJson: ""
              }
            }
          }
        }
      },
      { quoted: m }
    )

    await sock.relayMessage(from, msg.message, {
      messageId: msg.key.id
    })
  }
}