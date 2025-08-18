const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { ticketLog } = require("../../config.json")

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("close")) {
            let topic = interaction.channel.topic.split("|")

            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            if (!interaction.member.permissions.has("8")
                && interaction.user.id != topic[0].trim()
                && db.claimed.find(c => c.id === interaction.channel.id)?.user != interaction.user.id
            ) return interaction.reply({
                content: `:x: | ليس لديك صلاحيات لقفل هذه التذكرة`,
                ephemeral: true
            })

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** - سيتم قفل التذكرة بعد ( 5 ثواني ) **`)

            interaction.reply({
                embeds: [embed]
            }).then(async () => {
                let index = db.claimed.findIndex(c => c.id === interaction.channel.id)
                const claimedOwner = index === -1 ? "لا يوجد" : db.claimed[index].user

                if (index != -1) {
                    db.claimed.splice(index, 1)
                    await db.save();
                }

                setTimeout(async () => {
                    interaction.channel.delete();

                    let ch = interaction.guild.channels.cache.get(ticketLog)
                    if (!ch) reurn;

                    ch.send({
                        embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - سجل التذاكر

 - العضو | <@${topic[0].trim()}>

 - الأداري المستلم | ${claimedOwner === "لا يوجد" ? "لا يوجد" : `<@${claimedOwner}>`}

 - تم اقفال التذكرة من قبل | ${interaction.user}

 - اسم التذكرة | ${interaction.channel.name}

 -   .**`)]
                    })
                }, 5000)
            })
        }
    }
};
