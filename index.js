import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
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
        const { connection, lastDisconnect } = update

        if (connection === 'open') {
            console.log('✅ تم الاتصال بنجاح')
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log('❌ انقطع الاتصال')

            if (shouldReconnect) {
                startBot()
            }
        }
    })

    // طلب Pairing Code فقط إذا لم توجد جلسة
    setTimeout(async () => {
        try {
            if (!state.creds.registered) {
                const code = await sock.requestPairingCode('212657394310')
                console.log('\n Pairing Code:')
                console.log(code)
                console.log('')
            }
        } catch (err) {
            console.log('❌ خطأ Pairing Code:', err.message)
        }
    }, 5000)

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
