const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { ticket_roles, ticketLog } = require("../../config.json")
    , { addPoint } = require("../../functions");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("unclaim")) {
            let value = interaction.customId.split("_")[1]

            if (!interaction.member.roles.cache.has(ticket_roles[value])) return interaction.reply({
                content: `:x: | ليس لديك صلاحيات لاستلام هذه التذاكر`,
                ephemeral: true
            })

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`close_${value}`)
                    .setStyle("Danger")
                    .setLabel("قفل التذكرة"),

                new Discord.ButtonBuilder()
                    .setCustomId(`claim_${value}`)
                    .setStyle("Success")
                    .setLabel("استلام التذكرة")
            )

            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            let index = db.claimed.findIndex(ch => ch.id === interaction.channel.id)
            if(index === -1) {
                interaction.message.edit({ components: [row] })
                
                return interaction.reply({
                    content: `:x: | تعذر العثور على مستلم التذكرة لذلك تم إلغاءه`,
                    ephemeral: true
                })
            }

            db.claimed.splice(index, 1)
            await db.save();

            interaction.message.edit({ components: [row] })

            let embed = new Discord.EmbedBuilder().setColor("#003d66")
                .setDescription(`** - تم ترك الاستلام من قبل | ${interaction.user.id}**`)

            await interaction.reply({
                embeds: [embed]
            })

            addPoint(interaction.guild.id, interaction.user.id, "take_ticket", -4)

            let ch = interaction.guild.channels.cache.get(ticketLog)
            if(!ch) reurn;

            ch.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - سجل التذاكر

 - العضو | <@${interaction.channel.topic.split("|")[0].trim()}>

 - الأداري المسؤول عن ترك الاستلام | ${interaction.user}

 - اسم التذكرة | ${interaction.channel.name}

 -   .**`)]
            })
        }
    }
};
