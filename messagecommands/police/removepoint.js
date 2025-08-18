const userBase = require('../../Models/userBase')
const guildBase = require('../../Models/guildBase')
const { addPolicePoint } = require("../../functions")
module.exports = {
    name: `removepoint`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.police_high) return message.reply({
            content: `:x: | تعذر استخدام الامر بسبب عدم تعيين مسؤولين العساكر`
        })

        if (!message.guild.roles.cache.get(data.police_high)) return message.reply({
            content: `:x: | تعذر استخدام الامر بسبب عدم إيجاد رتبة مسؤولين العساكر داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.police_high)) return message.reply({
            content: `:x: | لا يمكنك استخدام هذا الامر لانك غير مسؤول`
        })

        let member = message.mentions.members.first()
        if (!member) return message.reply({
            content: `:x: | منشن العسكري الذي تريد خصم نقاط منه`
        })

        if (!data.police_admin) return message.reply({
            content: `:x: | تعذر استخدام الامر بسبب عدم تعيين رتبة العساكر`
        })

        if (!message.guild.roles.cache.get(data.police_admin)) return message.reply({
            content: `:x: | تعذر استخدام الامر بسبب عدم إيجاد رتبة العساكر داخل السيرفر`
        })

        if (!member.roles.cache.has(data.police_admin)) return message.reply({
            content: `:x: | هذا العضو ${member} ليس عسكري`
        })

        let check = data.policejoins.find(c => c.user === member.user.id)
        if (!check) return message.reply({
            content: `:x: | هذا العسكري غير مسجل دخوله`
        })

        let amount = args[1]
        if (!amount) return message.reply({
            content: `:x: | يجب عليك إرفاق كمية النقاط الذي تريد خصمها من العسكري`
        })
        amount = Number(amount)

        await addPolicePoint(message.guild.id, member.user.id, check.character, "others", -amount)

        //userData = userData[check.character]

        /*await userBase.updateOne(
            { guild: message.guild.id, user: member.user.id, [`${check.character}.police_points.name`]: "others" },
            { $inc: { [`${check.character}.police_points.$.value`]: parseInt(amount) } }
        );*/

        await message.reply({
            content: `Successfully remove **${amount}** point/s for ${member}`
        })
    }
};
