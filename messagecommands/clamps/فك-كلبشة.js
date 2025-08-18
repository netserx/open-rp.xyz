const userBase = require('../../Models/userBase')
    , guildBase = require('../../Models/guildBase')
    , { clambRole, clambLog } = require('../../config.json')

module.exports = {
    name: `فك-كلبشة`,
    run: async (client, message, args, Discord) => {
        if (!message.member.roles.cache.has(clambRole)) return;

        let user = message.mentions.users.first()
        if (!user) return message.reply({
            content: `:x: | يجب عليك ذكر الشخص الذي تريد فك كلبشته`
        })

        if(user.bot) return message.reply({
            content: `:x: | لا يمكنك فك كلبشة البوتات`
        })

        let db = await guildBase.findOne({ guild: message.guild.id })
        if (!db) {
            db = new guildBase({ guild: message.guild.id })
            await db.save();
        }

        let check = db.joins.find(c => c.user === message.author.id)
        if (!check) return message.reply({
            content: `:x: | يجب تسجيل دخولك حتى تتمكن من استخدام الامر`
        })

        let check2 = db.joins.find(c => c.user === user.id)
        if (!check2) return message.reply({
            content: `:x: | لن تتمكن من فك كلبشة ${user} لانه غير مسجل دخوله`
        })

        let data = await userBase.findOne({ guild: message.guild.id, user: user.id })
        if(!data) {
            data = new userBase({ guild: message.guild.id, user: user.id })
            await data.save();
        }

        data = data[check2.character]

        if(!data.clamped) return message.reply({
            content: `:x: | لا يمكنك فك كلبشة ${user} ، لانه غير مكلبش`
        })

        await userBase.updateOne({ guild: message.guild.id, user: user.id },
            {
                $set: {
                    [`${check2.character}.clamped`]: false,
                    [`${check2.character}.clamp_before`]: false
                }
            }
        );

        let mainData = await userBase.findOne({ guild: message.guild.id, user: message.author.id })
        if(!mainData) {
            mainData = new userBase({ guild: message.guild.id, user: message.author.id })
            await mainData.save();
        }

        mainData = mainData[check.character]

        let index = mainData.inv.findIndex(c => c.name === "handcuffs")
        index === -1 ? mainData.inv.push({ name: "handcuffs", count: 1 }) : mainData.inv[index].count += 1

        await userBase.updateOne({ guild: message.guild.id, user: message.author.id },
            {
                $set: {
                    [`${check.character}.inv`]: mainData.inv
                }
            }
        );

        await message.reply({
            content: `:white_check_mark: | تم فك كلبشة ${user} بنجاح`
        })

        let log = message.guild.channels.cache.get(clambLog)
        if(!log) return;

        log.send({
            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - تم فك كلبشة | ${user}

 - من قبل | ${message.author}

 - الشخصية | ${check2.character === "c1" ? "1" : "2"}

\`\`    . \`\` **`)]
        })
    }
};
