const config = require("../config");

module.exports = {
    name: "مطور",
    description: "يعرض معلومات المطور",
    async run(sock, m, args) {
        try {
            const from = m.key.remoteJid;
            const developerJid = config.DEVELOPERS[0]; // المطور الأساسي من config

            // إرسال كارت جهات الاتصال للمطور
            await sock.sendMessage(from, {
                contacts: {
                    displayName: config.DEV_NAME,
                    contacts: [
                        {
                            vcard: `BEGIN:VCARD
VERSION:3.0
FN:${config.DEV_NAME}
TEL;type=CELL;type=VOICE;waid=${config.DEV_NUM}:+${config.DEV_NUM}
END:VCARD`
                        }
                    ]
                }
            });

        } catch (err) {
            console.error('خطأ في أمر .مطور:', err);
        }
    }
};
