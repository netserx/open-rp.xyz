const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { ticket, ticket_roles, ticketLog } = require("../../config.json");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith("ticket_select")) {
            let value = interaction.values[0]

            let check = interaction.guild.channels.cache.find(ch => ch.topic && ch.topic.startsWith(`${interaction.user.id} | ${value}`))
            if (check) return interaction.reply({
                content: `:x: | لا يمكنك إنشاء أكثر من تكت لديك تكت بالفعل ${check}`,
                ephemeral: true
            })

            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            db.count[value]
            let count = db.count[value].toString().padStart(4, "0")
                , name = `ticket-${count}`

            await interaction.guild.channels.create({
                name: `${name}`,
                type: Discord.ChannelType.GuildText,
                parent: ticket[value],
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel],
                        allow: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.ReadMessageHistory, Discord.PermissionFlagsBits.AttachFiles]
                    },
                    {
                        id: interaction.user.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: ticket_roles[value],
                        allow: [Discord.PermissionFlagsBits.ViewChannel],
                    }
                ],
                topic: `${interaction.user.id} | ${value}`
            }).then(async ch => {
                interaction.message.edit({ components: interaction.message.components })
                await interaction.reply({ content: `:white_check_mark: | Ticket Created! ${ch}`, ephemeral: true })

                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`** - عزيزي العضو الرجاء كتابة سبب فتح التذكرة وانتظار الرد من المسؤول**`)
                    .setTimestamp()

                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId(`close_${value}`)
                        .setStyle("Danger")
                        .setLabel("قفل التذكرة"),

                    new Discord.ButtonBuilder()
                        .setCustomId(`claim_${value}`)
                        .setStyle("Success")
                        .setLabel("استلام التذكرة")
                )

                ch.send({
                    content: `** - تم فتح التذكرة بنجاح الرجاء انتظار المسؤول لأستلام تذكرتك
${interaction.user}** | <@&${ticket_roles[value]}>`,
                    embeds: [embed],
                    components: [row]
                })

                db.count[value] += 1
                await db.save();

                let loog = interaction.guild.channels.cache.get(ticketLog)
                if(!loog) reurn;

                const types = {
                    "support": "الدعم الفني", 
                    "high": "ادارة عليا",
                    "comp": "الشكاوي",
                    "add": "تيم الاضافة",
                    "store": "المتجر"
                }
    
                loog.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - سجل التذاكر

 - تم إنشاء التذكرة من قبل | ${interaction.user}

 - اسم التذكرة | ${ch.name}

 - نوع التذكرة : ${types[value]}

 -   .**`)]
                })
            })
        }
    }
};
