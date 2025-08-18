const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("getMoney")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            let check = data.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام البنك`,
                ephemeral: true
            })

            let db = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            db = db[check.character]

            let money = interaction.fields.getTextInputValue('money')
            if(isNaN(money)) return interaction.reply({
                content: `:x: | يجب عليك ذكر المبلغ بشكل صحيح`,
                ephemeral: true
            })
            money = parseInt(money)

            if(db.bank < money) return interaction.reply({
                content: `:x: | رصيد حسابك البنكي أقل من المبلغ الذي تريد سحبه`,
                ephemeral: true
            })

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`**  - سيتم اتمام عملية السحب هل انت متاكد من ارادة اتمام العملية ؟**`);

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`confirmm_getMoney_${money}_${check.character}`)
                    .setLabel("سحب")
                    .setStyle("Success"),

                new Discord.ButtonBuilder()
                    .setCustomId(`cancel_getMoney`)
                    .setLabel("إلغاء")
                    .setStyle("Danger")
            )

            interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            })
        }
    }
};
