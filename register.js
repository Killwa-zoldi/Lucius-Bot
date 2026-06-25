const fs = require("fs");
const path = require("path");

module.exports = {
    name: "تسجيل",
    description: "تسجيل لقب + العمر وحفظه في ملف",

    async run(sock, m, args) {
        try {
            const from = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;

            if (!args.length) {
                return await sock.sendMessage(from, {
                    text: "⚠️ الصيغة:\n.تسجيل لقبك . عمرك\nمثال:\n.تسجيل ميغومي فوشيغورو . 16"
                }, { quoted: m });
            }

            // تحويل args لجملة كاملة
            const text = args.join(" ").trim();

            // تقسيم اللقب والعمر عبر النقطة
            const parts = text.split(".");
            if (parts.length < 2) {
                return await sock.sendMessage(from, {
                    text: "❌ يجب أن تكتب لقبك ثم نقطة ثم عمرك.\nمثال:\n.تسجيل ميغومي فوشيغورو . 16"
                }, { quoted: m });
            }

            const name = parts[0].trim();
            const age = parts[1].trim();

            if (!name || !age || isNaN(age)) {
                return await sock.sendMessage(from, {
                    text: "❌ تحقق من الصيغة.\nالعمر يجب أن يكون رقمًا."
                }, { quoted: m });
            }

            // تحميل JSON
            const filePath = path.join(__dirname, "../data/userProfile.json");
            let db = {};

            if (fs.existsSync(filePath)) {
                db = JSON.parse(fs.readFileSync(filePath, "utf8"));
            }

            // حفظ البيانات
            db[sender] = {
                name,
                age: Number(age)
            };

            fs.writeFileSync(filePath, JSON.stringify(db, null, 2));

            await sock.sendMessage(from, {
                text: `✅ تم تسجيل بياناتك بنجاح!\n\n👤 اللقب: *${name}*\n🎂 العمر: *${age}*`
            }, { quoted: m });

        } catch (err) {
            console.error("خطأ في أمر تسجيل:", err);
            await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء التسجيل." }, { quoted: m });
        }
    }
};