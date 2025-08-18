const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("gen3ashhBuy")) {
            let value = interaction.customId.split("_")[1]
                , amount = Number(interaction.customId.split("_")[2])

            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            let check = data.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك حتى تتمكن من استخدام الانعاش`,
                ephemeral: true
            })

            let db = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            db = db[check.character]

            if (value === "hospital" && db.bank < amount) return interaction.update({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - رصيدك البنكي أقل من المبلغ المستحق دفعه**`)],
                components: []
            })

            if (value === "magic" && db.cash < amount) return interaction.update({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - رصيدك الكاش أقل من المبلغ المستحق دفعه**`)],
                components: []
            })


            value === "hospital" ? db.bank -= amount : db.cash -= amount

            await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                {
                    $set: {
                        [`${check.character}`]: db
                    }
                }
            );
            
            await interaction.update({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - تم انعاشك بنجاح .**`)],
                components: []
            })
        } else if (interaction.customId.startsWith("gen3ashhCancel")) {
            await interaction.update({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - تم الغاء عملية الانعاش**`)],
                components: []
            })
        }
    }
};
