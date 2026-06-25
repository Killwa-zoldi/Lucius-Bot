sock.ev.on("connection.update", async (update) => {
  const { connection, lastDisconnect, qr } = update;

  // QR
  if (qr) {
    console.log(" QR:");
    qrcodeTerminal.generate(qr, { small: true });
  }

  // Pairing Code
  if (!sock.authState.creds.registered) {
    const phoneNumber = "212XXXXXXXXX"; // حط رقمك
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(` Pairing Code: ${code}`);
  }

  if (connection === "open") {
    console.log("✅ تم الاتصال بنجاح");
  }

  if (connection === "close") {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    console.log("⚠️ انقطع الاتصال");

    if (reason !== DisconnectReason.loggedOut) {
      startBot();
    }
  }
});
