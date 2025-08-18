const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("createId")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            if (!data.idd || !data.idd?.channel || !data.idd?.role) return interaction.reply({
                content: `:x: | تعذر التقديم على هوية بسبب عدم تعيين اعدادات الهويات`,
                ephemeral: true
            })

            let db = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })

            const character = interaction.customId.split("_")[1]

            db = db[character]

            const first_name = interaction.fields.getTextInputValue('first_name')
                , last_name = interaction.fields.getTextInputValue('last_name')
                , birthday = interaction.fields.getTextInputValue('birthday')
                , birthplace = interaction.fields.getTextInputValue('birthplace')
                , gender = interaction.fields.getTextInputValue('gender');

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** التقديمات 

 - First Name | ${first_name}

 - Last Name | ${last_name}

 -  Birthday | ${birthday}

 - Brith Place | ${birthplace} 

> - GENDER | ${gender}**`);

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`accept_${interaction.user.id}_${character}`)
                    .setLabel("قبول الهوية")
                    .setStyle("Success"),

                new Discord.ButtonBuilder()
                    .setCustomId(`reject_${interaction.user.id}_${character}`)
                    .setLabel("رفض الهوية")
                    .setStyle("Danger")
            )

            let ch = interaction.guild.channels.cache.get(data.idd.channel)
            if (!ch) return interaction.reply({
                content: `:x: | تعذر إرسال التقديم بسبب عدم العثور على شات التقديمات`,
                ephemeral: true
            })

            ch.send({
                embeds: [embed],
                content: `${interaction.user}`,
                components: [row]
            })

            await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                {
                    $set: {
                        [`${character}.id`]: {
                            first: first_name,
                            last: last_name,
                            date: birthday,
                            place: birthplace,
                            gender: gender,
                            accepted: false
                        }
                    }
                }
            );

            await interaction.reply({
                content: `:white_check_mark: | تم إرسال هويتك للمراجعة`,
                ephemeral: true
            })
        }
    }
};
