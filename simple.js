const CHANNEL = {
    jid: "120363421488192809@newsletter",
    name: "𝐌𝐄𝐆𝐔𝐌𝐈恵⃝⃕ 🧢𝐁𝐎𝐓"
};

function wrapSendMessage(sock) {
    const originalSend = sock.sendMessage.bind(sock);

    sock.sendMessage = async (jid, content, options = {}) => {

        if (content?.react || content?.delete) {
            return originalSend(jid, content, options);
        }

        if (content)

        if (content?.text) {
            content.contextInfo = {
                ...(content.contextInfo || {}),
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: CHANNEL.jid,
                    newsletterName: CHANNEL.name,
                    serverMessageId: -1
                }
            };
        }

        return originalSend(jid, content, options);
    };
}

module.exports = { wrapSendMessage };
        serverMessageId: -1
                }
            };
        }

        return originalSend(jid, content, options);
    };
}

module.exports = { wrapSendMessage };
