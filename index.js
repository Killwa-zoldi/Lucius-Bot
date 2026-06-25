import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} from '@whiskeysockets/baileys'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')

    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

        if (connection === 'open') {
            console.log('✅ تم الاتصال')
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            if (shouldReconnect) {
                startBot()
            }
        }
    })

    if (!state.creds.registered) {
        const code = await sock.requestPairingCode('212657394310')
                                                    
        console.log(`PAIRING CODE: ${code}`)
    }

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
