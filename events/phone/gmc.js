const Discord = require('discord.js');
const guildBase = require('../../Models/guildBase');

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("gmc")) {
            let db = await guildBase.findOne({ guild: interaction.guild.id });
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id });
                await db.save();
            }

            const check = db.joins.find(c => c.user === interaction.user.id);
            if (!check) {
                await interaction.reply({
                    content: `:x: | يجب تسجيل دخولك أولاً حتى تتمكن من استخدام هذا الزر`,
                    flags: Discord.MessageFlags.Ephemeral
                });
                return;
            }

            if (!db.phone || !db.phone.gmc) {
                await interaction.reply({
                    content: `:x: | تعذر البلاغ بسبب عدم تعيين رومات البلاغات`,
                    flags: Discord.MessageFlags.Ephemeral
                });
                return;
            }

            if (!interaction.guild.channels.cache.get(db.phone.gmc)) {
                await interaction.reply({
                    content: `:x: | تعذر البلاغ بسبب عدم إيجاد روم البلاغ داخل هذا السيرفر`,
                    flags: Discord.MessageFlags.Ephemeral
                });
                return;
            }

            const modal = new Discord.ModalBuilder()
                .setCustomId(`reportGmc_${interaction.user.id}`)
                .setTitle('إنشاء بلاغ جديد');

            const reportData = new Discord.TextInputBuilder()
                .setCustomId('report_data')
                .setLabel("أدخل تفاصيل البلاغ")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setMaxLength(200);

            const reportImage = new Discord.TextInputBuilder()
                .setCustomId('report_image')
                .setLabel("رابط صورة (اختياري)")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(reportData),
                new Discord.ActionRowBuilder().addComponents(reportImage)
            );

            await interaction.showModal(modal);
        }
    }
};
