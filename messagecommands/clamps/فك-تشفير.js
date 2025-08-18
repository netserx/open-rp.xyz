const userBase = require('../../Models/userBase')
    , guildBase = require('../../Models/guildBase')
    , { clambLog } = require('../../config.json')
    , { createMap } = require('../../functions');

async function mission(type, guild, user, ch) {
    if (type === "success") {
        await userBase.updateOne({ guild: guild, user: user },
            {
                $set: {
                    [`${ch}.clamped`]: false
                }
            }
        );
    } else {
        await userBase.updateOne({ guild: guild, user: user },
            {
                $set: {
                    [`${ch}.clamp_before`]: true
                }
            }
        );
    }
}

module.exports = {
    name: `كسر-كلبشة`,
    run: async (client, message, args, Discord) => {
        let db = await guildBase.findOne({ guild: message.guild.id })
        if (!db) {
            db = new guildBase({ guild: message.guild.id })
            await db.save();
        }

        let check = db.joins.find(c => c.user === message.author.id)
        if (!check) return message.reply({
            content: `:x: | يجب تسجيل دخولك حتى تتمكن من استخدام الامر`
        })

        let data = await userBase.findOne({ guild: message.guild.id, user: message.author.id })
        if (!data) {
            data = new userBase({ guild: message.guild.id, user: message.author.id })
            await data.save();
        }

        data = data[check.character]

        if (!data.clamped) return message.reply({
            content: `:x: | لا يمكنك فك التشفير لانك غير مُكلبش`
        })

        if (data.clamp_before) return message.reply({
            content: `:x: | لا يمكنك فك التشفير لانك قمت بفشل فكه من قبل`
        })

        let index = data.inv.findIndex(c => c.name.toLowerCase() === "locksmith")
        if(index === -1 || data.inv[index].count < 1) return message.reply({
            content: `:x: | لا يمكنك كسر الكلبشة لانك لا تملك فاتح اقفال`
        })

        data.inv[index].count === 1 ? data.inv.splice(index, 1) : data.inv[index].count -= 1
        await userBase.updateOne({ guild: message.guild.id, user: message.author.id },
            {
                $set: {
                    [`${check.character}.inv`]: data.inv
                }
            }
        );

        const Function = createMap()

        const rows = [];
        for (let i = 0; i < 4; i++) {
            rows.push(new Discord.ActionRowBuilder().addComponents(Function.map.slice(i * 4, (i + 1) * 4)));
        }

        const msg = await message.reply({
            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`> لديك 5 ثواني فقط لحفظ أماكن المربعات الخضراء`)],
            components: rows
        });

        setTimeout(async () => {
            const rows2 = [];
            for (let i = 0; i < 4; i++) {
                rows2.push(new Discord.ActionRowBuilder().addComponents(Function.black.slice(i * 4, (i + 1) * 4)));
            }

            await msg.edit({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`> لديك 10 ثواني لتقم بتحديد أماكن المربعات الخضراء`)],
                components: rows2
            })

            const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 10500 });
            collector.on('collect', async interaction => {
                const index = parseInt(interaction.customId.split('_')[1]);

                if (Function.green.includes(index)) {
                    if (Function.green.length > 1) {
                        await interaction.update({
                            components: interaction.message.components.map(row =>
                                new Discord.ActionRowBuilder().addComponents(row.components.map(button =>
                                    button.customId === interaction.customId
                                        ? Discord.ButtonBuilder.from(button).setStyle("Success").setDisabled(true)
                                        : Discord.ButtonBuilder.from(button)
                                ))
                            )
                        })

                        Function.green.splice(Function.green.indexOf(index), 1);
                    } else {
                        await interaction.update({
                            components: rows,
                            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`> :white_check_mark: | تم فك التشفير بنجاح`)]
                        })

                        collector.stop('won');

                        mission("success", message.guild.id, message.author.id, check.character)
                    }
                } else {
                    await interaction.update({
                        embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`> :x: | فشل فك التشفير`)],
                        components: interaction.message.components.map(row =>
                            new Discord.ActionRowBuilder().addComponents(row.components.map(button =>
                                button.customId === interaction.customId
                                    ? Discord.ButtonBuilder.from(button).setStyle("Danger").setDisabled(true)
                                    : Discord.ButtonBuilder.from(button).setDisabled(true)
                            ))
                        )
                    });

                    collector.stop('lose');

                    mission("no", message.guild.id, message.author.id, check.character)
                }
            });

            collector.on('end', (_, reason) => {
                if (reason === 'won' || reason === "lose") return;

                msg.edit({
                    components: msg.components.map(row =>
                        new Discord.ActionRowBuilder().addComponents(row.components.map(button =>
                            Discord.ButtonBuilder.from(button).setDisabled(true)
                        ))
                    ),
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`> :x: | أنتهى الوقت وفشل فك التشفير`)]
                })

                mission("no", message.guild.id, message.author.id, check.character)

                let log = message.guild.channels.cache.get(clambLog)
                if (!log) return;

                log.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - تم فك التشفير

 - من قبل | ${message.author}

 - الشخصية | ${check.character === "c1" ? "1" : "2"}

\`\`   . \`\`**`)]
                })
            });
        }, 5000)
    }
};
