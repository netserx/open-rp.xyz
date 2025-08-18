const userBase = require('../../Models/userBase')
    , { clambLog, clambAdmin } = require('../../config.json')

module.exports = {
    name: `فك-كلبشات`,
    run: async (client, message, args, Discord) => {
        const checkRole = clambAdmin.some(role => message.member.roles.cache.some(r => r.name === role || r.id === role));
        if (!checkRole) return;

        let user = message.mentions.users.first()
        if (!user) return message.reply({
            content: `:x: | يجب عليك ذكر الشخص الذي تريد فك كلبشته`
        })

        let character = args[1], only = ["1", "2"]
        if(!character || !only.includes(character)) return message.reply({
            content: `:x: | يجب عليك ذكر الشخصية الذي تريد فك كلبشتها 1 / 2`
        })

        let data = await userBase.findOne({ guild: message.guild.id, user: user.id })
        if(!data) {
            data = new userBase({ guild: message.guild.id, user: user.id })
            await data.save();
        }

        character === "1" ? data = data.c1 : data = data.c2

        if(!data.clamped) return message.reply({
            content: `:x: | لا يمكنك فك كلبشة ${user} ، لانه غير مكلبش`
        })

        await userBase.updateOne({ guild: message.guild.id, user: user.id },
            {
                $set: {
                    [`c${character}.clamped`]: false,
                    [`c${character}.clamp_before`]: false
                }
            }
        );

        await message.reply({
            content: `:white_check_mark: | تم فك الكلبشة ${user} بنجاح`
        })

        let log = message.guild.channels.cache.get(clambLog)
        if (!log) return;

        log.send({
            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - تم فك كلبشة | ${user}

 - من قبل | ${message.author}

 - الشخصية | ${character}

\`\`   . \`\` **`)]
        })
    }
};
