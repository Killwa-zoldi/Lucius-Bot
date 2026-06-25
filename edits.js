const axios = require("axios");
const baileys = require("@whiskeysockets/baileys");
const {
  generateWAMessageContent,
  generateWAMessageFromContent
} = baileys;

// 📦 قالب الخطأ
function errorTemplate(reason) {
  return `╭─〔 ⚠️ خطأ 〕─╮
│ ${reason}
╰───────────────╯`;
}

// 🧠 منع تكرار الفيديوهات
const sentVideos = new Map();
const MAX_HISTORY = 100;

function rememberVideo(id) {
  sentVideos.set(id, Date.now());
  if (sentVideos.size > MAX_HISTORY) {
    const oldest = [...sentVideos.entries()]
      .sort((a, b) => a[1] - b[1])[0][0];
    sentVideos.delete(oldest);
  }
}

module.exports = {
  name: "ديت",
  description: "🔎 البحث وإرسال إيديتات من تيك توك",

  run: async (sock, m) => {
    try {
      const from = m.key.remoteJid;
      const text =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        "";

      const searchTerm = text.split(/\s+/).slice(1).join(" ").trim();

      if (!searchTerm) {
        return sock.sendMessage(
          from,
          { text: errorTemplate("اكتب كلمة للبحث\nمثال: .ديت انمي") },
          { quoted: m }
        );
      }

      // ⏳ رياكت + رسالة
      await sock.sendMessage(from, {
        react: { text: "⌛", key: m.key }
      });
      await sock.sendMessage(
        from,
        { text: `*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┣*

> *┃╻⏳╹↵ ❮ جـاري التحميل.. ❯*

*┗┅ ━━━━━━━━━━━━━━━ ┅ ━┣*` },
        { quoted: m }
      );

      const apiUrl = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(
        searchTerm + " edit"
      )}`;
      const { data } = await axios.get(apiUrl);

      if (data.code !== 0 || !data.data?.videos?.length) {
        return sock.sendMessage(
          from,
          { text: errorTemplate(`لم يتم العثور على نتائج لـ ${searchTerm}`) },
          { quoted: m }
        );
      }

      const results = data.data.videos;

      const fresh = results.filter(v => {
        const id = v.video_id || v.id || v.play;
        return id && !sentVideos.has(id);
      });

      if (!fresh.length) {
        return sock.sendMessage(
          from,
          { text: "⚠️ لا يوجد فيديو جديد حالياً." },
          { quoted: m }
        );
      }

      const selected = fresh.sort(() => 0.5 - Math.random()).slice(0, 3);
      const cards = [];
      let i = 1;

      async function makeVideo(url, title) {
        const { videoMessage } = await generateWAMessageContent(
          {
            video: { url },
            caption: `🎬 *${title}*`
          },
          { upload: sock.waUploadToServer }
        );
        return videoMessage;
      }

      for (const v of selected) {
        const vid = v.video_id || v.id || v.play;
        rememberVideo(vid);

        const videoMsg = await makeVideo(v.play, v.title || "Edit");

        cards.push({
          body: { text: `🎬 *${searchTerm}*\n📹 EDIT ${i++}` },
          header: { hasMediaAttachment: true, videoMessage: videoMsg },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "قــــــنـاة الـبــــوت 🗞",
                  url: "https://whatsapp.com/channel/0029VbBc8wq4o7qMV6TK6F2i"
                })
              }
            ]
          }
        });
      }

      const final = generateWAMessageFromContent(
        from,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: { text: `*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┣*

*┃╻✅╹↵ ❮ تـم الـتـحـمـيـل ❯*

*┏┅ ━━━━━━━━━━━━━━━ ┅ ━┣*` },
                carouselMessage: { cards }
              }
            }
          }
        },
        { quoted: m }
      );

      await sock.sendMessage(from, {
        react: { text: "✅", key: m.key }
      });
      await sock.relayMessage(from, final.message, {
        messageId: final.key.id
      });

    } catch (err) {
      console.error("❌ خطأ ايديت:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: errorTemplate(err.message) },
        { quoted: m }
      );
    }
  }
};