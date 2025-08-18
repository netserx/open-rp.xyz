const userBase = require('../../Models/userBase')
const guildBase = require('../../Models/guildBase')

module.exports = {
    name: `point`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        let check = data.policejoins.find(c => c.user === message.author.id)
        if (!check) return message.reply({
            content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام هذا الامر`
        })

        if (!data.police_admin) return message.reply({
            content: `:x: | تعذر استخدام الامر بسبب عدم تعيين العساكر`
        })

        if (!message.guild.roles.cache.get(data.police_admin)) return message.reply({
            content: `:x: | تعذر استخدام الامر بسبب عدم إيجاد رتبة العساكر داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.police_admin)) return message.reply({
            content: `:x: | لا يمكنك استخدام هذا الامر لانك غير عسكري`
        })

        let user = await userBase.findOne({ guild: message.guild.id, user: message.author.id })
        if (!user) {
            user = new userBase({ guild: message.guild.id, user: message.author.id })
            await user.save();
        }

        user = user[check.character]

        const total = user.police_points.reduce((total, point) => total + point.value, 0);

        let embed = new Discord.EmbedBuilder()
            .setColor("#030292")
            .setTimestamp()
            .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setImage("https://i.imgur.com/kIXD6WG.jpeg")
            .setDescription(`**  Point List | ${message.author}

 - Login | ${user.police_points.find(c => c.name ==="login").value}

 - Claim Report  | ${user.police_points.find(c => c.name ==="claim_report").value}

 - Receive Status | ${user.police_points.find(c => c.name ==="status").value}

 - Others | ${user.police_points.find(c => c.name ==="others").value}

 -  Total | ${total}**`)

        await message.reply({
            embeds: [embed]
        })
    }
};
