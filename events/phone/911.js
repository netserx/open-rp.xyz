const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("911")) {
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

            if (!db.phone || !db.phone.nineoneone) return interaction.reply({
                content: `:x: | تعذر البلاغ بسبب عدم تعيين رومات البلاغات`,
                ephemeral: true
            })

            if (!interaction.guild.channels.cache.get(db.phone.nineoneone)) return interaction.reply({
                content: `:x: | تعذر البلاغ بسبب عدم إيجاد روم البلاغ داخل هذا السيرفر`,
                ephemeral: true
            })

            const modal = new Discord.ModalBuilder()
                .setCustomId(`report911`)
                .setTitle('Create a new report');

            const Name = new Discord.TextInputBuilder()
                .setCustomId('name')
                .setLabel("Enter a name")
                .setStyle("Short");

            const report = new Discord.TextInputBuilder()
                .setCustomId('report')
                .setLabel("Enter a report")
                .setMaxLength(180)
                .setStyle("Paragraph");

            const Location = new Discord.TextInputBuilder()
                .setCustomId('location')
                .setLabel("Enter a location")
                .setStyle("Short");

            const row1 = new Discord.ActionRowBuilder().addComponents(Name);
            const row2 = new Discord.ActionRowBuilder().addComponents(report);
            const row3 = new Discord.ActionRowBuilder().addComponents(Location);

            modal.addComponents(row1, row2, row3);

            await interaction.showModal(modal);
        }
    }
};
