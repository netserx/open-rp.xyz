const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase');

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("carBuy_")) {
            const value = interaction.customId.split("_")[1]

            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام هذا الزر`,
                ephemeral: true
            })

            let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            if (!data) {
                data = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                await data.save();
            }

            data = data[check.character]

            if(data.builds.length <= 0) return interaction.reply({
                content: `:x: | لا يمكنك شراء هذه السيارة لانك لا تملك أي كراج`,
                ephemeral: true
            })

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.StringSelectMenuBuilder()
                .setCustomId(`carBuildchoose_${value}`)
                .setPlaceholder("Choose a garage where car get there")
                .setMaxValues(1)
                .addOptions(
                    data.builds.map((build, i) => {
                        return { label: `${build.name}`, emoji: "🏠", value: `${i}` }
                    })
                )
            )

            interaction.update({
                components: [row],
                ephemeral: true,
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - You must choose a carage**`)]
            })
        }
    }
};
