const axios = require('axios');
const { generateWAMessageContent, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

module.exports = {
  name: "بنتست",
  description: "🔍 البحث عن الصور في Pinterest وعرضها بشكل تفاعلي",
  usage: ".بنتست <كلمة البحث>",
  category: "downloader",

  run: async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;

    const query = args.join(' ').trim();
    if (!query) {
      return sock.sendMessage(from, { 
        text: `⚠️ أرسل الكلمة التي تريد البحث عنها.\n\nمثال: *.بنتست lisa blackpink*` 
      }, { quoted: m });
    }

    await sock.sendMessage(from, { react: { text: '⌛', key: m.key } });
    await sock.sendMessage(from, { text: '> ⏳ *جاري البحث عن الصور...*' }, { quoted: m });

    try {
      const res = await axios.get('https://blackwave-api.vercel.app/api/v1/search/pinterest', { params: { query } });
      if (!res.data?.status || !res.data?.pins || res.data.pins.length === 0) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
        return sock.sendMessage(from, { text: `❌ لم يتم العثور على نتائج لـ *"${query}"*.` }, { quoted: m });
      }

      const pins = res.data.pins.slice(0, 10);

      // دالة تجهيز صورة
      async function createImageMessage(url) {
        const { imageMessage } = await generateWAMessageContent(
          { image: { url } },
          { upload: sock.waUploadToServer }
        );
        return imageMessage;
      }

      const decorationTop = '༺┏⌟─໋─໋━᮫⃔⁺˚*•̩̩͙✩•̩̩͙*━᮫⃔─໋─໋⌜┓༻';
      const decorationBottom = '༺┗⌜─໋─໋━᮫⃔⁺˚*•̩̩͙✩•̩̩͙*━᮫⃔─໋─໋⌟┛༻';
      const botCredit = '┠ ᳹🎭 ͜ 🖤 MEGUMI BOT 🖤';

      const cards = [];
      for (let i = 0; i < pins.length; i++) {
        const pin = pins[i];
        if (!pin.image) continue;

        const imageMsg = await createImageMessage(pin.image);
        const title = pin.title || 'بدون عنوان';
        const description = pin.description || 'لا يوجد وصف';
        const uploader = pin.uploader?.username || pin.uploader?.full_name || 'غير معروف';

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `
${decorationTop}
📌 *رقم الصورة:* ${i + 1}
🔍 *بحث:* ${query}
📝 *العنوان:* ${title}
💬 *الوصف:* ${description.substring(0,80)}${description.length > 80 ? '...' : ''}
👤 *الناشر:* ${uploader}
⚠️ *المطور غير مسؤول عما تبحث*
${decorationBottom}
${botCredit}`
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: imageMsg
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "🧢 قــنــاة الـبــوت",
                  url: "https://whatsapp.com/channel/0029VbBc8wq4o7qMV6TK6F2i"
                })
              }
            ]
          })
        });
      }

      const headerText = `
${decorationTop}
🔍 *نتائج البحث عن:* ${query}
📊 *عدد النتائج:* ${pins.length}
💡 *نصيحة:* ابحث بكلمات دقيقة أو بالإنجليزية
${decorationBottom}
${botCredit}`;

      const finalMsg = generateWAMessageFromContent(from, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({ text: headerText }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
            })
          }
        }
      }, { quoted: m });

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      await sock.relayMessage(from, finalMsg.message, { messageId: finalMsg.key.id });

    } catch (err) {
      console.error('❌ خطأ Pinterest:', err);
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
      await sock.sendMessage(from, { text: `❌ حدث خطأ: ${err.message}` }, { quoted: m });
    }
  }
};