const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { addPoint } = require("../../functions");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("endCome")) {
            let user = interaction.customId.split("_")[1]
            if (interaction.user.id != user) return interaction.reply({
                content: `:x: | لا يمكنك استخدام هذا الزر`,
                ephemeral: true
            })

            let memberId = interaction.customId.split("_")[2]
            let member = interaction.guild.members.cache.get(memberId)
            if (!member) return interaction.reply({
                content: `:x: | لا استطيع ايجاد العضو داخل هذا السيرفر`,
                ephemeral: true
            })

            member.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66")
                    .setDescription(`** -   .

 - عزيزي اللاعب | ${member}
تم الانتهاء من الاستدعاء بشكل ناجح
من قبل الإداري | ${interaction.user}

متمنين لك التوفيق - **`)]
            }).then(async () => {
                let herer = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`:white_check_mark: | تم إنهاء الاستدعاء وإضافة 4 نقاط ادارية`)

                await interaction.message.edit({
                    components: [],
                    embeds: [herer]
                })
            }).catch(async () => {
                let herer = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`:x: | تم إضافة لك 4 نقاط ادارية لكن لم اتمكن من إرسال رسالة الانهاء للعضو`)

                await interaction.message.edit({
                    components: [],
                    embeds: [herer]
                })
            })

            addPoint(interaction.guild.id, interaction.user.id, "take_report", 4)

            let data = await guildBase.findOne({ guild: interaction.guild.id })

            let ch = interaction.guild.channels.cache.get(data.comes.log)
            if (!ch) return;

            let type = interaction.customId.split("_")[3]

            ch.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - انهاء الاستدعاء العضو |

 - من قبل الاداري | ${interaction.user}

 - نوع الاستدعاء | ${type}**`)]
            })
        }
    }
};
