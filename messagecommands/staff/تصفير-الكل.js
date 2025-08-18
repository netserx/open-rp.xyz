const userBase = require('../../Models/userBase')
const guildBase = require('../../Models/guildBase')

module.exports = {
    name: `تصفير-الكل`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.points_admin) return message.reply({
            content: `:x: | تعذر تصفير النقاط بسبب عدم تعيين رتبة مسؤولين النقاط`
        })

        if (!message.guild.roles.cache.get(data.points_admin)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة مسؤولين النقاط داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.points_admin)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك لست مسؤول عن النقاط`
        })

        let users = await userBase.find({ guild: message.guild.id })
        users.forEach(async db => {
            db.points = {}
            await db.save();
        })

        await message.reply({
            content: `:white_check_mark: | تم تصفير نقاط كل الاداريين`
        })
    }
};
