const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { addPoint } = require("../../functions");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("tshherStart")) {
            if(interaction.user.id != interaction.customId.split("_")[1]) return;

            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            if (!data.tshher_channel) return interaction.reply({
                content: `:x: | تعذر التشهير  بسبب عدم تعيين روم التشهيرات`,
                ephemeral: true
            })

            if (!interaction.guild.channels.cache.get(data.tshher_channel)) return interaction.reply({
                content: `:x: | لا أستطيع ايجاد روم التشهير داخل السيرفر`,
                ephemeral: true
            })

            const modal = new Discord.ModalBuilder()
                .setCustomId(`tshherModal`)
                .setTitle('Create a new tshher');

            const PsId = new Discord.TextInputBuilder()
                .setCustomId('ps_id')
                .setLabel("Enter sony user id")
                .setStyle("Short");

            const discordId = new Discord.TextInputBuilder()
                .setCustomId('discord_id')
                .setLabel("Enter user discord id")
                .setStyle("Short");

            const discordUsername = new Discord.TextInputBuilder()
                .setCustomId('discord_username')
                .setLabel("Enter user discord username")
                .setStyle("Short");

            const Reason = new Discord.TextInputBuilder()
                .setCustomId('reason')
                .setLabel("Enter reason")
                .setStyle("Short");

            const row1 = new Discord.ActionRowBuilder().addComponents(PsId);
            const row2 = new Discord.ActionRowBuilder().addComponents(discordId);
            const row3 = new Discord.ActionRowBuilder().addComponents(discordUsername);
            const row4 = new Discord.ActionRowBuilder().addComponents(Reason);

            modal.addComponents(row1, row2, row3, row4);

            await interaction.showModal(modal);
        }
    }
};
