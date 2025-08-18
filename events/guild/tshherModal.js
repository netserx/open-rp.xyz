const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("tshherModal")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            const sonyId = interaction.fields.getTextInputValue('ps_id')
                , discordId = interaction.fields.getTextInputValue('discord_id')
                , discordUsername = interaction.fields.getTextInputValue('discord_username')
                , reason = interaction.fields.getTextInputValue('reason');

            let msg = await interaction.update({
                content: null,
                components: [],
                embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`> **لديك دقيقتين حتى ترفق صور للدلائل التي تؤيد كلامك**`)]
            })

            const filter = m => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter: filter, time: 120000 });

            collector.on('collect', async message => {
                let image = message.attachments.first()
                if (!image) {
                    msg.edit({
                        embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`> **:x: | يجب إرفاق صورة**`)]
                    })

                    return collector.stop("ee");
                }

                if (!image.contentType.startsWith("image")) {
                    msg.edit({
                        embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`> **:x: | يجب إرفاق صور فقط**`)]
                    })

                    return collector.stop("ee");
                }

                let channel = interaction.guild.channels.cache.get(data.tshher_channel)
                if (!channel) {
                    msg.edit({
                        embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`> **:x: | تعذر إيجاد روم التشهيرات داخل هذا السيرفر**`)]
                    })

                    return collector.stop("ee");
                }

                channel.send({
                    content: `|| @everyone ||`,
                    embeds: [new Discord.EmbedBuilder().setThumbnail(interaction.guild.iconURL()).setColor("#003d66").setImage(image.url).setDescription(`\`\`Id Ps : ${sonyId}
id Discord : ${discordId}
User Discord : ${discordUsername}
Reason : ${reason}

# -    .\`\` `)]
                }).then(() => {
                    channel.send({
                        files: ["https://i.imgur.com/LGcsHp8.jpeg"]
                    }).then(() => {
                        channel.send({
                            files: ["https://i.imgur.com/5at.png"]
                        })
                    })
                })

                await msg.edit({
                    embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`> **:white_check_mark: | تم نشر التشهير بنجاح**`)]
                })

                return collector.stop("ee");
            });

            collector.on('end', (collected, reason) => {
                if (reason === "ee") return;

                return msg.edit({
                    embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setDescription(`> **:x: | فشلت عملية التشهير ، حاول في وقت لاحق**`)]
                })
            });


        }
    }
};
