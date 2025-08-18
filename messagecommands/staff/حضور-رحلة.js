const guildBase = require('../../Models/guildBase')
, { addPoint } = require("../../functions");

module.exports = {
    name: `حضور-رحلة`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.staff_role) return message.reply({
            content: `:x: | تعذر حضور رحلة بسبب عدم تعيين رتبة الادارة`
        })

        if (!message.guild.roles.cache.get(data.staff_role)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة الادارة داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.staff_role)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك لست اداري`
        })

        addPoint(message.guild.id, message.author.id, "join_game", 3)

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setDescription(`** - تم اضافة 3 نقاط ادارية لك**`)

        await message.reply({
            embeds: [embed]
        })
    }
};
