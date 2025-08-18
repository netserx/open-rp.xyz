const Discord = require("discord.js")
const userBase = require("../../Models/userBase")
const guildBase = require("../../Models/guildBase")

module.exports = {
    name: `حذف-هويات`,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("8")) return;

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(`confirm`)
                .setLabel("تأكيد")
                .setStyle("Success"),

            new Discord.ButtonBuilder()
                .setCustomId(`cancel`)
                .setLabel("إلغاء")
                .setStyle("Danger")
        )

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setDescription(`> **هل أنت متأكد أنك تريد حذف جميع الهويات**`)

        let msg = await message.reply({
            embeds: [embed],
            components: [row]
        })

        const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 20000 })
        collector.on('collect', async i => {
            if (i.user.id != message.author.id) return i.reply({
                content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر`,
                ephemeral: true
            })

            if (i.customId === "confirm") {
                let db = await userBase.find({})
                db.forEach(async data => {
                    await userBase.updateOne({ guild: message.guild.id, user: data.user },
                        {
                            $set: { 
                                [`c1.id`]: {},
                                [`c2.id`]: {}
                            }
                            
                        }
                    );

                    await guildBase.updateOne({ guild: message.guild.id },
                        {
                            $set: { [`joins`]: [] }
                        }
                    );
                })

                await msg.edit({
                    content: `:white_check_mark: | تم حذف جميع الهويات بنجاح`,
                    components: [],
                    embeds: []
                })
            } else if (i.customId === "cancel") {
                i.deferUpdate();

                await msg.edit({
                    content: `:white_check_mark: | تم إلغاء عملية الحذف`,
                    components: [],
                    embeds: []
                })
            }
        });

        collector.on('end', () => {
            msg.edit({ content: "أنتهى الوقت", embeds: [], components: [] })
        });
    }
};
