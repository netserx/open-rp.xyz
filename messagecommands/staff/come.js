const guildBase = require("../../Models/guildBase")

module.exports = {
    name: `come`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.staff_role) return message.reply({
            content: `:x: | خطأ بسبب عدم تعيين رتبة الادارة`
        })

        if (!message.guild.roles.cache.get(data.staff_role)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة الادارة داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.staff_role)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك لست اداري`
        })

        let user = message.mentions.users.first()
        if (!user) return message.reply({
            content: `:x: | يجب عليك ذكر الشخص الذي تريد إستدعاءه`
        })

        if (user.bot || user.id === message.author.id) return message.reply({
            content: `:x: | لا يمكنك إستدعاء ${user}`
        })

        user.send({
            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - عزيزي العضو | ${user}

 - تم طلبك من قبل الإداري | ${message.author}

الرجاء حضور | ${message.channel}

متمنين لك التوفيق - >**`)]
        }).then(() => {
            return message.react("✅")
        }).catch(() => {
            return message.react("❌")
        })
    }
};
