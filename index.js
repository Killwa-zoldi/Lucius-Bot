const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")

const P = require("pino")

const qrcode = require("qrcode-terminal")

const fs = require("fs")

const path = require("path")

const chalk = require("chalk")

const config = require("./config")

const { loadCommands } = require("./commandLoader")

const commands = loadCommands("./commands")

const dataDir = path.join(__dirname, "data")

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

const jsonData = {}

fs.readdirSync(dataDir).forEach(file => {

  if (!file.endsWith(".json")) return

  const name = file.replace(".json", "")

  try {

    jsonData[name] = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"))

  } catch {

    jsonData[name] = {}

  }

})

if (!jsonData.bank) fs.writeFileSync(path.join(dataDir, "bank.json"), JSON.stringify(jsonData.bank = {}, null, 2))

if (!jsonData.replies) fs.writeFileSync(path.join(dataDir, "replies.json"), JSON.stringify(jsonData.replies = {}, null, 2))

if (!jsonData.bot) fs.writeFileSync(path.join(dataDir, "bot.json"), JSON.stringify(jsonData.bot = { enabled: true }, null, 2))

function saveJSON(name) {

  if (!jsonData[name]) return

  fs.writeFileSync(path.join(dataDir, `${name}.json`), JSON.stringify(jsonData[name], null, 2))

}

let gameState = {}

async function startMegumi() {

  const { state, saveCreds } = await useMultiFileAuthState("./auth")

  const sock = makeWASocket({

    logger: P({ level: "silent" }),

    auth: state,

    printQRInTerminal: false,

    generateHighQualityLinkPreview: true

  })

  const { wrapSendMessage } = require("./simple")

  wrapSendMessage(sock)

  

  console.log(chalk.cyanBright(`

███╗   ███╗███████╗ ██████╗ ██╗   ██╗███╗   ███╗██╗

████╗ ████║██╔════╝██╔═══██╗██║   ██║████╗ ████║██║

██╔████╔██║█████╗  ██║ ██══╝██║   ██║██╔████╔██║██║

██║╚██╔╝██║██╔══╝  ██║   ██║██║   ██║██║╚██╔╝██║██║

██║ ╚═╝ ██║███████╗╚██████╔╝╚██████╔╝██║ ╚═╝ ██║██║

╚═╝     ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝

`))

  sock.ev.on("connection.update", update => {

    const { qr, connection, lastDisconnect } = update

    if (qr) qrcode.generate(qr, { small: true })

    if (connection === "open") console.log(chalk.greenBright("✅ Bot connected successfully"))

    if (connection === "close") {

      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason !== DisconnectReason.loggedOut) startMegumi()

    }

  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async ({ messages, type }) => {

    if (type !== "notify") return

    const m = messages[0]

    if (!m.message) return

    const from = m.key.remoteJid

    const sender = m.key.participant || from

    const isBotMessage = m.key.fromMe

    const body = m.message.conversation || m.message.extendedTextMessage?.text || ""

    const botStatus = jsonData.bot?.enabled ?? true

    if (!from.endsWith("@g.us") && !isBotMessage) {

      await sock.sendMessage(from, {

  image: { url: "https://i.ibb.co/MDR4GFgf/8613bf9a4a587e4455e3bfcffea1ef32.webp" },

  caption: `*╔════════⊹⊱❖⊰⊹════════╗*

*┃ ⚠️ تحذير هام ⚠️ ┃*

*╠════════⊹⊱❖⊰⊹════════╣*

*┃ 🙅‍♂️ لا يمكنني استقبال رسائل خاصة لتخفيف الضغط على البوت*

*┃ 🚫 تم حظرك تلقائياً من التواصل معي*

*┃ 💡 يرجى استخدام البوت فقط داخل المجموعات*

*╚════════⊹⊱❖⊰⊹════════╝*`

})

      await sock.updateBlockStatus(sender, "block")

      return

    }

    if (body.startsWith(config.PREFIX)) {

      const args = body.slice(config.PREFIX.length).trim().split(/ +/)

      const cmdName = args.shift()?.toLowerCase()

      if (!botStatus && !config.DEVELOPERS.includes(sender)) return

      if (commands[cmdName]) {

        try {

          await commands[cmdName].run(sock, m, args, { gameState, bank: jsonData.bank }, jsonData, saveJSON)

        } catch {

          if (botStatus || config.DEVELOPERS.includes(sender)) {

            await sock.sendMessage(from, { text: `⚠️ خطأ في تنفيذ الأمر ${config.PREFIX}${cmdName}` }, { quoted: m })

          }

        }

      } else {

        if (!botStatus && !config.DEVELOPERS.includes(sender)) return

        const text = `╭─〔 ⚠️ خطأ 〕─╮

│ لقد بحثت عن أمر \`${config.PREFIX}${cmdName}\` ولم أجده

╰───────────────╯`

        await sock.sendMessage(from, { text }, { quoted: m })

      }

      return

    }

    if (!isBotMessage) {

      for (const [q, a] of Object.entries(jsonData.replies)) {

        if (body.toLowerCase() === q.toLowerCase()) {

          if (botStatus || config.DEVELOPERS.includes(sender)) {

            await sock.sendMessage(from, { text: a }, { quoted: m })

          }

          break

        }

      }

      for (const cmd of Object.values(commands)) {

        if (typeof cmd.reactMessage === "function") {

          if (botStatus || config.DEVELOPERS.includes(sender)) {

            try {

              await cmd.reactMessage(sock, m, gameState, jsonData)

            } catch {}

          }

        }

      }

    }

  })

  for (const cmd of Object.values(commands)) {

    if (typeof cmd.init === "function") {

      try {

        await cmd.init(sock, dataDir, jsonData, saveJSON)

      } catch {}

    }

  }

}

startMegumi()