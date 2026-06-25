const fs = require("fs");
const path = require("path");

const guessAnime = [
 { img: 'https://i.postimg.cc/5tXSHP1D/IMG-20250827-WA0382.jpg', answer: 'ناروتو', hint: 'ن*ر*ت*' },
 { img: 'https://i.ibb.co/3mT2fRDX/02bc1ddfb478c7069ac1db5017955648.webp', answer: 'لوفي', hint: 'ل*ف*' },
 { img: 'https://i.postimg.cc/Fs8fYfJT/image.png', answer: 'غوكو', hint: 'غ*ك*' },
 { img: 'https://i.postimg.cc/hGm7WNK4/IMG-20250826-WA0686.jpg', answer: 'ايرين', hint: 'ا*ر*ن' },
 { img: 'https://i.ibb.co/LTdcNDF/684105f51352029d09277ffec85f3c95.webp', answer: 'ايتشيغو', hint: 'ا*ت*غ*' },
 { img: 'https://i.postimg.cc/gkHnSmkm/51a097b7-fefa-4bba-8247-9bfa571e89c8.jpg', answer: 'سايتاما', hint: 'س*ت*م*' },
 { img: 'https://i.postimg.cc/59BqFQd9/IMG-20250828-WA0294.jpg', answer: 'تانجيرو', hint: 'ت*ج*ر*' },
 { img: 'https://i.postimg.cc/RhdHpf4c/IMG-20250825-WA0149.jpg', answer: 'غيو', hint: 'غ*و' },
 { img: 'https://i.postimg.cc/FznYgzCs/852ff6d5-81d8-4360-aa97-88c90e0d0db5.jpg', answer: 'ليفاي', hint: 'ل*ي*' },
 { img: 'https://i.postimg.cc/d0yhD9qV/IMG-20250831-WA0287.jpg', answer: 'ساسكي', hint: 'س*س*ك*' },
 { img: 'https://i.postimg.cc/sftyS5wG/IMG-20250824-WA0492.jpg', answer: 'ميكاسا', hint: 'م*ك*س*' },
 { img: 'https://i.ibb.co/XfzbWV9H/eae47b1f7a746a3f73086b763023e134.webp', answer: 'جينتاما', hint: 'ج*ن*ا*ا' },
 { img: 'https://i.postimg.cc/CMPyHk7s/IMG-20250824-WA0850.jpg', answer: 'مايكي', hint: 'م*ي*ك*' },
 { img: 'https://i.postimg.cc/cLFb7S0k/IMG-20250826-WA0713.jpg', answer: 'كانيكي', hint: 'ك*ن*ك*' },
 { img: 'https://i.postimg.cc/QMtBsrz1/IMG-20250831-WA0286.jpg', answer: 'ميدوريا', hint: 'م*د*ر*' },
 { img: 'https://i.postimg.cc/KztZ1D1x/950d3233-d206-41df-9a1a-72371d099586.jpg', answer: 'مادارا', hint: 'م*د*ر*' },
 { img: 'https://i.postimg.cc/KjbfSqmg/dafb2a69-da08-456a-b6aa-11bfe3430d99.jpg', answer: 'كيلوا', hint: 'ك*ل*و*' },
 { img: 'https://i.ibb.co/G4rVzxJr/fb0ce789556df725874af998fb83ba9d.webp', answer: 'ايساغي', hint: 'ا*س*غ*' },
 { img: 'https://i.ibb.co/FqkRNx3P/IMG-20250831-WA0306.webp', answer: 'ياغامي لايت', hint: 'ي*غ*م* ل*ت' },
 { img: 'https://i.ibb.co/dwp6FFcQ/IMG-20250829-WA0139.webp', answer: 'ميرويم', hint: 'م*ر*و*م' },
 { img: 'https://i.ibb.co/TDDbfCR8/IMG-20250827-WA0400.webp', answer: 'سيباستيان', hint: 'س*ب*س*ت*' },
 { img: 'https://i.ibb.co/HLDMg9FT/IMG-20250826-WA0794.webp', answer: 'دانتي', hint: 'د*ن*ت*' },
 { img: 'https://i.ibb.co/qFNyRXzw/IMG-20250831-WA0307.webp', answer: 'يونو', hint: 'ي*ن*' },
 { img: 'https://i.ibb.co/9H48dkDD/IMG-20250831-WA0308.webp', answer: 'كورابيكا', hint: 'ك*ر*ب*ك*' },
 { img: 'https://i.ibb.co/ycg2sPmx/IMG-20250831-WA0309.webp', answer: 'ويز', hint: 'و*ز' },
 { img: 'https://i.ibb.co/sptmqXC3/7374b307a280775c2d9c9b938038d94d.webp', answer: 'يوريتشي', hint: 'ي*ر*ت*' },
 { img: 'https://i.ibb.co/YTygQ540/IMG-20250831-WA0312.webp', answer: 'اوبيتو', hint: 'أ*ب*ت*' },
 { img: 'https://i.ibb.co/236XvdCd/IMG-20250831-WA0313.webp', answer: 'توبيراما', hint: 'ت*ب*ر*م*' },
 { img: 'https://i.ibb.co/PZPCS0vD/IMG-20250831-WA0314.webp', answer: 'ميناتو', hint: 'م*ن*ت*' },
 { img: 'https://i.ibb.co/wNgr65p8/IMG-20250831-WA0316.webp', answer: 'ايزن', hint: 'أ*ز*ن' },
 { img: 'https://i.ibb.co/JRfKMLmW/IMG-20250831-WA0317.webp', answer: 'دوما', hint: 'د*م*' },
 { img: 'https://i.ibb.co/RF8GrsP/IMG-20250831-WA0318.webp', answer: 'غوكو بلاك', hint: 'غ*ك* ب*ك' },
 { img: 'https://i.ibb.co/23kyyW1h/IMG-20250831-WA0319.webp', answer: 'زاماسو', hint: 'ز*م*س*' },
 { img: 'https://i.ibb.co/dJ5jP7nj/IMG-20250831-WA0320.webp', answer: 'رينغوكو', hint: 'ر*ن*غ*ك' },
 { img: 'https://i.ibb.co/23PZbRnp/IMG-20250831-WA0321.webp', answer: 'زينيتسو', hint: 'ز*ن*ت*س*' },
 { img: 'https://i.ibb.co/pBRFRMjP/IMG-20250831-WA0324.webp', answer: 'اينوسكي', hint: 'أ*ن*س*ك*' },
 { img: 'https://i.ibb.co/JW7LfdsH/59f097dd809bab8910a9986a4aca52dd.webp', answer: 'موزان', hint: 'م*ز*ن' },
 { img: 'https://i.ibb.co/WWzj5YJV/IMG-20250831-WA0326.webp', answer: 'استا', hint: 'أ*س*ت*' },
 { img: 'https://i.ibb.co/4RL4RCqw/c0dc11fe4d437318306061e3466ce7ec.webp', answer: 'كايزر', hint: 'ك*ي*ز*' },
 { img: 'https://i.ibb.co/G3NNLjPX/2946d0568741dbad80922820e6483892.webp', answer: 'ساكورا', hint: 'س*ك*ر*' },
 { img: 'https://i.ibb.co/cKQBpCGJ/IMG-20250828-WA0339.webp', answer: 'غوجو', hint: 'غ*ج*' },
 { img: 'https://i.ibb.co/jk7dFh0/IMG-20250827-WA0040.webp', answer: 'ليبي', hint: 'ل*ب*' },
 { img: 'https://i.ibb.co/FqVv6NNx/IMG-20250831-WA0333.webp', answer: 'سونغ جين وو', hint: 'س*ن*غ ج*ن' },
 { img: 'https://i.ibb.co/XxT40fp0/31d3e787c52e450d63dd09c8905fba8c.webp', answer: 'اوباناي', hint: 'أ*ب*ن*ي' },
 { img: 'https://i.ibb.co/C528xyKQ/IMG-20250831-WA0336.webp', answer: 'ماهوراغا', hint: 'م*ه*ر*غ*' },
 { img: 'https://i.ibb.co/dsFmVVMd/IMG-20250831-WA0337.webp', answer: 'ساكاموتو', hint: 'س*ك*م*ت*' },
 { img: 'https://i.ibb.co/Ndq57Hc0/IMG-20250831-WA0338.webp', answer: 'غريمجو', hint: 'غ*ر*م*ج*' },
 { img: 'https://i.ibb.co/7NXjYgQ8/b4b577e1debf1235e5386898686c4605.webp', answer: 'ميغومي', hint: 'م*غ*م*' },
];

const reward = 5000;
const timeoutMs = 30000;
const activeGuess = {};

module.exports = {
  name: "احزر",
  run: async (sock, msg, args, { bank }, jsonData, saveJSON) => {
    const chat = msg.key.remoteJid;

    if (activeGuess[chat]) {
      return sock.sendMessage(chat, { text: "⚠️ توجد لعبة تخمين نشطة حالياً." }, { quoted: msg });
    }

    const data = guessAnime[Math.floor(Math.random() * guessAnime.length)];
    activeGuess[chat] = { ...data };

    await sock.sendMessage(chat, {
      image: { url: data.img },
      caption: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
        ✦ 𝑮𝒖𝒆𝒔𝒔 𝑨𝒏𝒊𝒎𝒆 ✦
*╚═══════⊹⊱❖⊰⊹═══════╝*

🧠 خمن اسم الشخصية
💰 الجائزة: ${reward} درهم
⏳ الوقت: 30 ثانية

✦ اكتب الإجابة في الدردشة
✦ لطلب تلميح اكتب: *.تلميح*
      `.trim()
    }, { quoted: msg });

    const timer = setTimeout(() => {
      delete activeGuess[chat];
      sock.sendMessage(chat, { text: `⌛ انتهى الوقت!\nالإجابة الصحيحة هي: *${data.answer}*` });
    }, timeoutMs);

    const handler = async ({ messages }) => {
      const m = messages[0];
      const text = m.message?.conversation?.trim();
      const sender = m.key.participant || m.key.remoteJid;
      if (!text || !activeGuess[chat]) return;

      if (text === ".تلميح") {
        return sock.sendMessage(chat, { text: `💡 التلميح: ${data.hint}` }, { quoted: m });
      }

      if (text !== data.answer) return;

      clearTimeout(timer);
      delete activeGuess[chat];

      if (!jsonData.bank[sender]) jsonData.bank[sender] = { money: 0 };
      jsonData.bank[sender].money += reward;
      saveJSON("bank");

      await sock.sendMessage(chat, {
        text: `
*╔═══════⊹⊱❖⊰⊹═══════╗*
        🏆 فائز التخمين
*╚═══════⊹⊱❖⊰⊹═══════╝*

👤 @${sender.split("@")[0]}
✅ الإجابة صحيحة
💰 +${reward} درهم
💼 رصيدك: ${jsonData.bank[sender].money}
        `.trim(),
        mentions: [sender]
      });

      sock.ev.off("messages.upsert", handler);
    };

    sock.ev.on("messages.upsert", handler);
  }
};