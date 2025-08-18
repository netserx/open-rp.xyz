const Discord = require("discord.js")
const userBase = require("../../Models/userBase")
const guildBase = require("../../Models/guildBase")

module.exports = {
    name: `حذف-هوية`,
    run: async (client, message, args) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.idd || !data.idd.admin) return message.reply({
            content: `:x: | تعذر رفض الهوية بسبب عدم تعيين مسؤولين الهويات`
        })

        if (!message.guild.roles.cache.get(data.idd.admin)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.idd.admin)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر لانك غير مسؤول عن الهويات`
        })

        let user = message.mentions.users.first();
        if (!user) return message.reply({
            content: `:x: | يجب عليك منشن الشخص الذي تريد حذف هويته`
        })

        let character = args[1], only = ["1", "2"]
        if (!character || !only.includes(character)) return message.reply({
            content: `:x: | يجب عليك تحديد الشخصية الذي تريد حذف هويتها 1 / 2`
        })

        await userBase.updateOne({ guild: message.guild.id, user: user.id },
            {
                $set: { [`${character === "1" ? "c1" : "c2"}.id`]: {} }
            }
        );

        await message.reply({
            content: `:white_check_mark: | تم حذف هوية الشخصية ${character === "1" ? "الاولى" : "الثانية"} بنجاح`
        })
    }
};
