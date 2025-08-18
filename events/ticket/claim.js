const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { ticket_roles, ticketLog } = require("../../config.json")
    , { addPoint } = require("../../functions.js")


module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("claim")) {
            let value = interaction.customId.split("_")[1]

            if (!interaction.member.roles.cache.has(ticket_roles[value])) return interaction.reply({
                content: `:x: | ليس لديك صلاحيات لاستلام هذه التذاكر`,
                ephemeral: true
            })

            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            db.claimed.push({ id: interaction.channel.id, user: interaction.user.id })
            await db.save();

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`close_${value}`)
                    .setStyle("Danger")
                    .setLabel("قفل التذكرة"),

                new Discord.ButtonBuilder()
                    .setCustomId(`unclaim_${value}`)
                    .setStyle("Secondary")
                    .setLabel("ترك التذكرة")
            )

            interaction.message.edit({ components: [row] })

            let embed = new Discord.EmbedBuilder().setColor("#003d66")
                .setDescription(`**  -   .

 - تم استلام التذكرة بنجاح من قبل | ${interaction.user}

كيف اقدر اخدمك | <@${interaction.channel.topic.split("|")[0].trim()}>**`)

            await interaction.reply({
                embeds: [embed]
            })

            addPoint(interaction.guild.id, interaction.user.id, "take_ticket", 4)

            let ch = interaction.guild.channels.cache.get(ticketLog)
            if(!ch) reurn;

            ch.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - سجل التذاكر

 - العضو | <@${interaction.channel.topic.split("|")[0].trim()}>

 - الأداري المستلم | ${interaction.user}

 - اسم التذكرة | ${interaction.channel.name}

 -   .**`)]
            })
        }
    }
};
