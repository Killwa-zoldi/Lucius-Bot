import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update

    if ((connection === 'connecting' || qr) && !sock.authState.creds.registered) {

      const phoneNumber = '212657394310' // رقمك بدون +

      const code = await sock.requestPairingCode(phoneNumber)

      console.log('========================')
      console.log('PAIRING CODE:', code)
      console.log('========================')
    }

    if (connection === 'open') {
      console.log('✅ تم الاتصال بنجاح')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    if (text === '.بوت') {
      await sock.sendMessage(from, {
        text: '✅ البوت شغال'
      })
    }
  })
}

startBot()
