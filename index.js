import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";
import qrcodeTerminal from "qrcode-terminal";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  // Pairing Code
  if (!sock.authState.creds.registered) {
    const phoneNumber = "212XXXXXXXXX"; // حط رقمك هنا

    const code = await sock.requestPairingCode(phoneNumber);

    console.log("━━━━━━━━━━━━━━━━━━━━");
    console.log(" Pairing Code:");
    console.log(code);
    console.log("━━━━━━━━━━━━━━━━━━━━");
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(" QR CODE:");
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ تم الاتصال بنجاح");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("⚠️ انقطع الاتصال");

      if (shouldReconnect) {
        startBot();
      }
    }
  });
}

startBot();
