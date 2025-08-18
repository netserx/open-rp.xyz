const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("phone")) {
            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام الهاتف`,
                ephemeral: true
            })

            let choice = interaction.customId.split("_")[1]

            if (choice === "users") {
                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`** - قم باختيار الخدمة المرادة .**`);

                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId("911")
                        .setLabel("911")
                        .setStyle("Secondary"),

                    new Discord.ButtonBuilder()
                        .setCustomId("gmc")
                        .setLabel("X")
                        .setStyle("Secondary"),
                )

                await interaction.reply({
                    ephemeral: true,
                    components: [row],
                    embeds: [embed]
                })
            } else if (choice === "msg") {
                const modal = new Discord.ModalBuilder()
                    .setCustomId(`createMSG`)
                    .setTitle('Create a new message');

                const discordId = new Discord.TextInputBuilder()
                    .setCustomId('discord_id')
                    .setLabel("Enter a user discord id")
                    .setStyle("Short");

                const message = new Discord.TextInputBuilder()
                    .setCustomId('msg')
                    .setLabel("Enter a message")
                    .setMaxLength(180)
                    .setStyle("Paragraph");

                const row1 = new Discord.ActionRowBuilder().addComponents(discordId);
                const row2 = new Discord.ActionRowBuilder().addComponents(message);

                modal.addComponents(row1, row2);

                await interaction.showModal(modal);
            }
        }
    }
};
