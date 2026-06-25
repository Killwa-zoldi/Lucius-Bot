import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  let codeRequested = false;

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    try {
      if (!sock.authState.creds.registered && !codeRequested) {
        codeRequested = true;

        const phoneNumber = "212XXXXXXXXX"; // حط رقمك هنا

        const code = await sock.requestPairingCode(phoneNumber);

        console.log("━━━━━━━━━━━━━━━━━━");
        console.log(" Pairing Code:");
        console.log(code);
        console.log("━━━━━━━━━━━━━━━━━━");
      }
    } catch (err) {
      console.error("❌ خطأ Pairing Code:", err);
    }

    if (connection === "open") {
      console.log("✅ تم الاتصال بنج
