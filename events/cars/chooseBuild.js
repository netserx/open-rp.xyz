const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { cars } = require('../../cars.json')
    , userBase = require('../../Models/userBase');
    
module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith("carBuildchoose_")) {
            const value = interaction.customId.split("_")[1]
            , car = cars[value]
            , choice = interaction.values[0]

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

            let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            if (!data) {
                data = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                await data.save();
            }

            data = data[check.character]

            if(data.builds[choice].garage <= data.builds[choice].cars.length) return interaction.update({
                content: `:x: | الكراج مملتئ لا يمكنك شراء سيارات أخرى`,
                ephemeral: true,
                components: [],
                embeds: []
            })

            let car_check = data.builds[choice].cars.find(c => c.name.toLowerCase() === car.name.toLowerCase())
            if (car_check) return interaction.update({
                content: `:x: | لقد قمت بشراء هذه السيارة لهذا البيت من قبل`,
                ephemeral: true,
                components: [],
                embeds: []
            })

            if (data.cash < Number(car.price)) return interaction.reply({
                content: `:x: | رصيدك الكاش أقل من سعر السيارة`,
                ephemeral: true
            })

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                .setCustomId(`bbcar_confirm_${value}_${choice}`)
                .setStyle("Success")
                .setLabel("Confirm"),

                new Discord.ButtonBuilder()
                .setCustomId("bbcar_cancel")
                .setStyle("Danger")
                .setLabel("Cancel")
            )

            interaction.update({
                components: [row],
                ephemeral: true,
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Do you want to continue buy progress?**`)]
            })
        }
    }
};
