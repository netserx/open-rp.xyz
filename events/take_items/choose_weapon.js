const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , weapons = require("../../weapons.json")
    , cooldowns = new Map()

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith("takepolice")) {
            let value = interaction.values[0]

            const weapon = Object.values(weapons).flat()[value]

            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            let check = data.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك حتى تتمكن من الاستلام`,
                ephemeral: true
            })

            const now = Date.now();
            const cooldownAmount = 5 * 24 * 60 * 60 * 1000;

            if (cooldowns.has(interaction.user.id)) {
                const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / (1000 * 60 * 60 * 24);
                    return interaction.update({
                        embeds: [],
                        components: [],
                        content: `:x: | يجب عليك أنتظار ${timeLeft.toFixed(1)} ايام حتى تتمكن من الاستلام`,
                        ephemeral: true
                    })
                }
            }

            let db = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            if (!db) {
                db = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                await db.save();
            }
            db = db[check.character]

            let index = db.inv.findIndex(c => c.name.toLowerCase() === weapon.name.toLowerCase())
            index === -1 ? db.inv.push({ name: `${weapon.name}`, count: 1 }) : db.inv[index].count += 1
            
            await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                {
                    $set: {
                        [`${check.character}`]: db
                    }
                }
            );

            interaction.update({
                embeds: [],
                components: [],
                ephemeral: true,
                content: `** - ( ${weapon.name} ) successfully claimed, next claim after 5 days.**`
            })

            cooldowns.set(interaction.user.id, now);

            setTimeout(() => cooldowns.delete(interaction.user.id), cooldownAmount);

            if(!data.police_log) return;
            let log = interaction.guild.channels.cache.get(data.police_log)
            if(!log) return;

            log.send({
                embeds: [
                    new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**Police Log 

 - الشخص | ${interaction.user}

 - نوع الستورج | 2

 - تم اضافة | ${weapon.name}

 - العدد | 1

 - الشخصية | ${check.character === "c1" ? "1" : "2"}

\`\`   \`\`**`)
                ]
            })
        }
    }
}