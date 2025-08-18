const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("transferMoney")) {
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

            let iban = interaction.fields.getTextInputValue('iban')

            let userInfo;
            try {
                const result = await userBase.findOne({
                    $or: [
                        { "c1.id.iban": iban },
                        { "c2.id.iban": iban }
                    ]
                })
                if (result) {
                    result.c1.id.iban === iban ? userInfo = { user: result.user, cha: "c1" } : userInfo = { user: result.user, cha: "c2" }
                } else {
                    return interaction.reply({
                        content: `:x: | لا استطيع ايجاد بيانات بهذا الايبان تأكد من الايبان`,
                        ephemeral: true
                    })
                }
            } catch (err) {
                console.error(err)
            }

            if (userInfo.user === interaction.user.id) return interaction.reply({
                content: `:x: | لا تستطيع التحويل لنفسك`,
                ephemeral: true
            })

            let money = interaction.fields.getTextInputValue('money')
            if (isNaN(money)) return interaction.reply({
                content: `:x: | يجب عليك ذكر المبلغ بشكل صحيح`,
                ephemeral: true
            })
            money = parseInt(money)

            if (db.bank < money) return interaction.reply({
                content: `:x: | رصيدك في البنك أقل من المبلغ الذي تريد تحويله`,
                ephemeral: true
            })

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** - سيتم اتمام عملية التحويل هل انت متاكد من ارادة اتمام العملية ؟**`);

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`confirmm_transfer_${money}_${check.character}_${userInfo.user}_${userInfo.cha}_${iban}`)
                    .setLabel("تحويل")
                    .setStyle("Success"),

                new Discord.ButtonBuilder()
                    .setCustomId(`cancel_transfer`)
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
