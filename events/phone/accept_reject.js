const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;
        if (interaction.customId.startsWith("reportAccept")) {
            const value = interaction.customId.split("_")[1]
                , user = interaction.message.mentions.users.first()

            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (value === "gmc" && !data.gmc_admin) return interaction.reply({
                content: `:x: | تعذر القبول بسبب عدم تعيين مسؤولين الرقابة`,
                ephemeral: true
            })

            if (value === "911" && !data.police_admin) return interaction.reply({
                content: `:x: | تعذر القبول بسبب عدم تعيين مسؤولين العساكر`,
                ephemeral: true
            })

            if (value === "gmc" && !interaction.guild.roles.cache.get(data.gmc_admin)) return interaction.reply({
                content: `:x: | تعذر القبول بسبب عدم إيجاد رتبة مسؤولين الرقابة داخل السيرفر`,
                ephemeral: true
            })

            if (value === "911" && !interaction.guild.roles.cache.get(data.police_admin)) return interaction.reply({
                content: `:x: | تعذر القبول بسبب عدم إيجاد رتبة مسؤولين العساكر داخل السيرفر`,
                ephemeral: true
            })

            if (!interaction.member.roles.cache.has(value === "gmc" ? data.gmc_admin : data.police_admin)) return interaction.reply({
                content: `:x: | لا يمكنك استخدام هذا الزر لانك غير مسؤول`,
                ephemeral: true
            })

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`**${value === "911" ? msg = " - تم قبول بلاغك من قبل وزارة الداخلية" : " - تم قبول بلاغك من قبل الرقابة"}**`)

            user.send({
                embeds: [embed]
            }).catch(() => null)

            interaction.message.edit({
                content: `${user} | Accepted`,
                components: interaction.message.components.map(row =>
                    new Discord.ActionRowBuilder().addComponents(row.components.map(button =>
                            Discord.ButtonBuilder.from(button).setStyle("Success").setDisabled(true)
                    ))
                )
            })
            await interaction.reply({
                content: `:white_check_mark: | تم قبول البلاغ بنجاح`,
                ephemeral: true
            })
        } else if (interaction.customId.startsWith("reportReject")) {
            const value = interaction.customId.split("_")[1]
                , user = interaction.message.mentions.users.first()

            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (value === "gmc" && !data.gmc_admin) return interaction.reply({
                content: `:x: | تعذر الرفض بسبب عدم تعيين مسؤولين الرقابة`,
                ephemeral: true
            })

            if (value === "911" && !data.police_admin) return interaction.reply({
                content: `:x: | تعذر الرفض بسبب عدم تعيين مسؤولين العساكر`,
                ephemeral: true
            })

            if (value === "gmc" && !interaction.guild.roles.cache.get(data.gmc_admin)) return interaction.reply({
                content: `:x: | تعذر الرفض بسبب عدم إيجاد رتبة مسؤولين الرقابة داخل السيرفر`,
                ephemeral: true
            })

            if (value === "911" && !interaction.guild.roles.cache.get(data.police_admin)) return interaction.reply({
                content: `:x: | تعذر الرفض بسبب عدم إيجاد رتبة مسؤولين الرقابة داخل السيرفر`,
                ephemeral: true
            })

            if (!interaction.member.roles.cache.has(value === "gmc" ? data.gmc_admin : data.police_admin)) return interaction.reply({
                content: `:x: | لا يمكنك استخدام هذا الزر لانك غير مسؤول`,
                ephemeral: true
            })

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`**${value === "911" ? msg = " - تم رفض بلاغك من قبل وزارة الداخلية" : " - تم رفض بلاغك من قبل الرقابة"}**`)

            user.send({
                embeds: [embed]
            }).catch(() => null)

            interaction.message.edit({
                content: `${user} | Rejected`,
                components: interaction.message.components.map(row =>
                    new Discord.ActionRowBuilder().addComponents(row.components.map(button =>
                            Discord.ButtonBuilder.from(button).setStyle("Success").setDisabled(true)
                    ))
                )
            })
            await interaction.reply({
                content: `:white_check_mark: | تم رفض البلاغ بنجاح`,
                ephemeral: true
            })
        }
    }
};
