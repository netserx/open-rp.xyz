const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { builds } = require('../../builds.json')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith("builds_menu")) {
            let value = interaction.values[0]

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

            let ban_check = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            if(!ban_check) {
                ban_check = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                await ban_check.save();
            }

            ban_check = ban_check[check.character]
            if(ban_check.clamped) return interaction.reply({
                ephemeral: true,
                content: `** - انت مكلبش لايمكنك شراء عقار**`
            })

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`buildBuy_${value}`)
                    .setStyle("Success")
                    .setLabel("Buy House")
            )

            const build = builds[value]

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage(`${build.image}`)
                .setDescription(`** — Apartment Name ( ${build.name} )
🚗 - Garage ( ${build.garage} )
📦 - Storage space ( ${build.storage} )
 - Apartment Location ( ${build.location} )
 - Apartment Price ( ${build.price.toLocaleString("en-US")} ) **`)

            interaction.message.edit({ components: interaction.message.components })
            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
                components: [row]
            })

        }
    }
};
