const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { builds } = require('../../builds.json')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith("own_builds_menu")) {
            if(interaction.user.id != interaction.customId.split("_")[3]) return;

            const value = interaction.values[0]

            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام المتجر`,
                ephemeral: true
            })

            let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            if (!data) {
                data = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                await data.save();
            }

            data = data[check.character]
            if (data.clamped) return interaction.reply({
                ephemeral: true,
                content: `** - انت مكلبش لايمكنك التعديل عقار**`
            })

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`houseActions_cars_${value}_${interaction.user.id}`)
                    .setStyle("Secondary")
                    .setLabel("House Carage"),

                new Discord.ButtonBuilder()
                    .setCustomId(`houseActions_add_${value}_${interaction.user.id}`)
                    .setStyle("Secondary")
                    .setLabel("Add Safe"),

                new Discord.ButtonBuilder()
                    .setCustomId(`houseActions_take_${value}_${interaction.user.id}`)
                    .setStyle("Secondary")
                    .setLabel("Take Safe")
            )

            const build = data.builds[value]

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage(`${build.image}`)
                .setDescription(`** — Apartment Name ( ${build.name} )
🚗 - Garage ( ${build.garage} )
📦 - Storage space ( ${build.storage} )
 - Apartment Location ( ${build.location} )
 - Apartment Price ( ${build.price.toLocaleString("en-US")} ) **`)

            await interaction.update({
                embeds: [embed],
                ephemeral: true,
                components: [row]
            })

        }
    }
};
