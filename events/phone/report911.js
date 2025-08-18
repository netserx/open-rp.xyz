const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("report911")) {
            const Name = interaction.fields.getTextInputValue('name')
                , Report = interaction.fields.getTextInputValue('report')
                , Location = interaction.fields.getTextInputValue('location');

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** - Police Reports 

 - Name | ${Name}

 - Report | ${Report}

 - Location | ${Location}

\`\` Police System . \`\` **`);

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`reportAccept_911_${interaction.user.id}`)
                    .setLabel("قبول البلاغ")
                    .setStyle("Success"),

                new Discord.ButtonBuilder()
                    .setCustomId(`reportReject_911_${interaction.user.id}`)
                    .setLabel("رفض البلاغ")
                    .setStyle("Danger")
            )

            let data = await guildBase.findOne({ guild: interaction.guild.id })
            let ch = interaction.guild.channels.cache.get(data.phone.nineoneone)
            if (!ch) return interaction.reply({
                content: `:x: | تعذر إرسال البلاغ بسبب عدم العثور على شات البلاغ`,
                ephemeral: true
            })

            ch.send({
                embeds: [embed],
                content: `${interaction.user}`,
                components: [row]
            })

            await interaction.reply({
                content: `:white_check_mark: | تم إرسال بلاغك للمراجعة`,
                ephemeral: true
            })
        }
    }
};