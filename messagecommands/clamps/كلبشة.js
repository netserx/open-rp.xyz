const userBase = require('../../Models/userBase');
const guildBase = require('../../Models/guildBase');
const { clambRole, clambLog } = require('../../config.json');

module.exports = {
    name: `كلبشة`,
    run: async (client, message, args, Discord) => {
        try {
            // التحقق من الرتبة
            if (!message.member.roles.cache.has(clambRole)) {
                return message.reply({ content: `:x: | ليس لديك صلاحية استخدام هذا الأمر` });
            }

            // التحقق من المنشن
            let user = message.mentions.users.first();
            if (!user) {
                return message.reply({ content: `:x: | يجب عليك ذكر الشخص الذي تريد كلبشته` });
            }

            // منع كلبشة البوتات
            if (user.bot) {
                return message.reply({ content: `:x: | لا يمكنك كلبشة البوتات` });
            }

            // جلب بيانات السيرفر
            let db = await guildBase.findOne({ guild: message.guild.id });
            if (!db) {
                db = new guildBase({ guild: message.guild.id, joins: [] });
                await db.save();
            }

            // التحقق من تسجيل الدخول
            let check = db.joins.find(c => c.user === message.author.id);
            if (!check) {
                return message.reply({ content: `:x: | يجب تسجيل دخولك حتى تتمكن من استخدام الأمر` });
            }

            let check2 = db.joins.find(c => c.user === user.id);
            if (!check2) {
                return message.reply({ content: `:x: | ${user} غير مسجل دخوله` });
            }

            // جلب بيانات الهدف
            let userDataDoc = await userBase.findOne({ guild: message.guild.id, user: user.id });
            if (!userDataDoc) {
                userDataDoc = new userBase({ guild: message.guild.id, user: user.id, c1: { inv: [], clamped: false }, c2: { inv: [], clamped: false } });
                await userDataDoc.save();
            }
            let userData = userDataDoc[check2.character];
            if (!userData) {
                return message.reply({ content: `:x: | بيانات شخصية الهدف (${check2.character}) غير موجودة` });
            }

            // التحقق إذا كان الهدف مكلبش بالفعل
            if (userData.clamped) {
                return message.reply({ content: `:x: | تم كلبشة ${user} في الشخصية ${check2.character === "c1" ? "الأولى" : "الثانية"} من قبل` });
            }

            // جلب بياناتك أنت
            let mainDataDoc = await userBase.findOne({ guild: message.guild.id, user: message.author.id });
            if (!mainDataDoc) {
                mainDataDoc = new userBase({ guild: message.guild.id, user: message.author.id, c1: { inv: [], clamped: false }, c2: { inv: [], clamped: false } });
                await mainDataDoc.save();
            }
            let mainData = mainDataDoc[check.character];
            if (!mainData) {
                return message.reply({ content: `:x: | بيانات شخصيتك (${check.character}) غير موجودة` });
            }

            // التحقق من وجود الكلبشات في الحقيبة
            let index = mainData.inv.findIndex(c => c.name.toLowerCase() === "handcuffs");
            if (index === -1) {
                return message.reply({ content: `:x: | لا تملك كلبشات داخل حقيبة الشخصية ${check.character === "c1" ? "الأولى" : "الثانية"}` });
            }

            // إزالة الكلبش من الحقيبة
            if (mainData.inv[index].count === 1) {
                mainData.inv.splice(index, 1);
            } else {
                mainData.inv[index].count -= 1;
            }

            // تحديث بياناتك
            await userBase.updateOne({ guild: message.guild.id, user: message.author.id }, {
                $set: { [`${check.character}.inv`]: mainData.inv }
            });

            // تحديث بيانات الهدف
            await userBase.updateOne({ guild: message.guild.id, user: user.id }, {
                $set: { [`${check2.character}.clamped`]: true }
            });

            // إرسال رسالة DM للهدف
            try {
                await user.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("#003d66")
                            .setDescription(`** - تم كلبشتك من قبل | ${message.author}\n\n - الشخصية | ${check2.character === "c1" ? "1" : "2"}\n\n\`\`   . \`\`**`)
                    ]
                });
            } catch (err) {
                console.warn(`لا يمكن إرسال DM إلى ${user.tag}`);
            }

            // رد في الشات
            await message.reply({ content: `✅ | تم كلبشة ${user} بنجاح` });

            // إرسال لوق
            let log = message.guild.channels.cache.get(clambLog);
            if (log) {
                log.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("#003d66")
                            .setDescription(`** - تم كلبشة | ${user}\n\n - من قبل | ${message.author}\n\n - الشخصية | ${check2.character === "c1" ? "1" : "2"}\n\n\`\`   . \`\` **`)
                    ]
                });
            }
        } catch (err) {
            console.error(err);
            message.reply({ content: `:x: | حدث خطأ: ${err.message}` });
        }
    }
};
