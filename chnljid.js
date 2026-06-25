module.exports = {
    name: "مم",
    description: "استخراج ID القناة من رابط واتساب",
    async run(sock, m, args) {
        try {
            const from = m.key.remoteJid;
            const text = args.join(" ");

            // تحقق من وجود رابط
            if (!text) {
                return await sock.sendMessage(from, {
                    text: "⚠️ أرسل رابط قناة واتساب\nمثال:\n.قناة https://whatsapp.com/channel/XXXX"
                }, { quoted: m });
            }

            // تحقق أنه رابط قناة
            if (!text.includes("https://whatsapp.com/channel/")) {
                return await sock.sendMessage(from, {
                    text: "❌ هذا ليس رابط قناة واتساب صالح."
                }, { quoted: m });
            }

            // استخراج كود الدعوة
            const inviteCode = text.split("https://whatsapp.com/channel/")[1]?.trim();
            if (!inviteCode) {
                return await sock.sendMessage(from, {
                    text: "❌ لم أستطع استخراج كود القناة من الرابط."
                }, { quoted: m });
            }

            // جلب بيانات القناة من واتساب
            const data = await sock.newsletterMetadata("invite", inviteCode);

            if (!data?.id) {
                return await sock.sendMessage(from, {
                    text: "❌ فشل في جلب معرف القناة."
                }, { quoted: m });
            }

            // إرسال ID القناة
            await sock.sendMessage(from, {
                text: `📢 *تم العثور على القناة بنجاح*\n\n🆔 ID القناة:\n\`${data.id}\`\n\n📛 الاسم:\n${data.name || "غير متوفر"}`
            }, { quoted: m });

        } catch (err) {
            console.error("❌ خطأ في أمر .قناة:", err);
            await sock.sendMessage(m.key.remoteJid, {
                text: "⚠️ حدث خطأ أثناء جلب معرف القناة."
            }, { quoted: m });
        }
    }
};