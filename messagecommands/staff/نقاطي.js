const userBase = require('../../Models/userBase')
const guildBase = require('../../Models/guildBase')

module.exports = {
    name: `نقاطي`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.staff_role) return message.reply({
            content: `:x: | تعذر الكشف عن النقاط بسبب عدم تعيين رتبة الادارة`
        })

        if (!message.guild.roles.cache.get(data.staff_role)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة الادارة داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.staff_role)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك لست اداري`
        })

        let user = await userBase.findOne({ guild: message.guild.id, user: message.author.id })
        if (!user) {
            user = new userBase({ guild: message.guild.id, user: message.author.id })
            await user.save();
        }

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setAuthor({ name: "كشف النقاط" })
            .setThumbnail(message.guild.iconURL())
            .setTimestamp()
            .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setDescription(`** - فتح رحلة | ${user.points.start_game}

 - حضور رحلة | ${user.points.join_game}

 - قبول هويات | ${user.points.id}

 - حضور رقابي | ${user.points.gmc}

 - استلام تذكرة | ${user.points.take_ticket}

 - التفعيل | ${user.points.tf3el}

 - استلام شكوى | ${user.points.take_report}

 - الاضافة | ${user.points.others}

 - المجموع الكلي | ${user.points.start_game + user.points.join_game + user.points.id + user.points.gmc + user.points.take_ticket + user.points.tf3el + user.points.take_report + user.points.others}**`)

        await message.reply({
            embeds: [embed]
        })
    }
};
