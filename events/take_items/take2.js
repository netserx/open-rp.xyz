const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , weapons = require("../../weapons.json");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("2take_items")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            if (!data.police_admin) return interaction.reply({
                content: `:x: | تعذر الاستلام بسبب عدم تعيين مسؤولين العساكر`,
                ephemeral: true
            })

            if (!interaction.guild.roles.cache.get(data.police_admin)) return interaction.reply({
                content: `:x: | تعذر الاستلام بسبب عدم إيجاد رتبة مسؤولين العساكر داخل السيرفر`,
                ephemeral: true
            })

            if (!interaction.member.roles.cache.has(data.police_admin)) return interaction.reply({
                content: `:x: | لا يمكنك استخدام هذا الزر لانك غير مسؤول`,
                ephemeral: true
            })

            let check = data.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك حتى تتمكن من الاستلام`,
                ephemeral: true
            })
            
            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId("takepolice")
                    .setMaxValues(1)
                    .setPlaceholder("Choose the weapon you want to take")
                    .addOptions(Object.values(weapons).flat().map((dd, i) => {
                        return { label: `${dd.name}`, value: `${i}` }
                    }))
            )

            let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setDescription(`**> Choose the weapon you want to take**`)
            await interaction.reply({
                components: [row],
                ephemeral: true,
                embeds: [embed]
            })
        }
    }
};