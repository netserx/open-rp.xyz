const userBase = require('../../Models/userBase')
const guildBase = require('../../Models/guildBase')

module.exports = {
    name: `ازالة-نقاط`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.points_admin) return message.reply({
            content: `:x: | تعذر ازالة نقاط بسبب عدم تعيين رتبة مسؤولين النقاط`
        })

        if (!message.guild.roles.cache.get(data.points_admin)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة مسؤولين النقاط داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.points_admin)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك لست مسؤول عن النقاط`
        })

        let member = message.mentions.members.first()
        if(!member) return message.reply({
            content: `:x: | يجب عليك منشن الاداري الذي تريد خصم نقاط منه`
        })
        if(member.user.bot) return message.reply({
            content: `:x: | لا تستطيع خصم نقاط من بوتات`
        })
        if(!member.roles.cache.has(data.staff_role)) return message.reply({
            content: `:x: | لا يمكنك ازالة نقاط من غير الاداريين`
        })

        let amount = args[1]
        if(!amount || isNaN(amount)) return message.reply({
            content: `:x: | يجب عليك تحديد كمية النقاط الذي تريد خصمها من العضو`
        })

        let user = await userBase.findOne({ guild: message.guild.id, user: member.user.id })
        if (!user) {
            user = new userBase({ guild: message.guild.id, user: member.user.id })
            await user.save();
        }

        user.points.others -= Number(amount)
        await user.save();

        await message.reply({
            content: `:white_check_mark: | تم خصم ${amount} نقطة من الاداري ${member}`
        })
    }
};
