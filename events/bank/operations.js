const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("confirmm")) {
            let value = interaction.customId.split("_")[1]
                , money = interaction.customId.split("_")[2]
                , cha = interaction.customId.split("_")[3];
            money = Number(money)

            if (value === "addMoney" || value === "getMoney") {
                let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
                if (!data) {
                    data = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                    await data.save();
                }

                data = data[cha]

                await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                    {
                        $set: {
                            [`${cha}.bank`]: value === "addMoney" ? parseInt(data.bank + money) : parseInt(data.bank - money),
                            [`${cha}.cash`]: value === "addMoney" ? parseInt(data.cash - money) : parseInt(data.cash + money)
                        }
                    }
                );

                interaction.update({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** تم ${value === "addMoney" ? `إيداع مبلغ ( ${money} ) داخل حسابك البنكي` : `سحب مبلغ ( ${money} ) من حسابك البنكي`}
    
     - Maze Bank**`)], ephemeral: true, components: []
                })

                let db = await guildBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
                if (!db || !db.bank_log) return;

                let ch = interaction.guild.channels.cache.get(db.bank_log)
                if (!ch) return;

                ch.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - تم اتمام عملية ${value === "addMoney" ? "ايداع" : "سحب"} من قبل | ${interaction.user}

 - المبلغ | ${money}

   .**`)]
                })
            } else if (value === "transfer") {
                let customId = interaction.customId.split("_")
                    , money = Number(customId[2])
                    , cha = customId[3]
                    , user = customId[4]
                    , userCa = customId[5]
                    , iban = customId[6]

                let db = await userBase.findOne({ guild: interaction.guild.id, user: user })
                if (!db) {
                    db = new userBase({ guild: interaction.guild.id, user: user })
                    await db.save();
                }
                db = db[userCa]

                let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
                if (!data) {
                    data = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                    await data.save();
                }
                data = data[cha]

                await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                    {
                        $set: {
                            [`${cha}.bank`]: parseInt(data.bank - money)
                        }
                    }
                );

                await userBase.updateOne({ guild: interaction.guild.id, user: user },
                    {
                        $set: {
                            [`${userCa}.bank`]: parseInt(db.bank + money)
                        }
                    }
                );

                await interaction.update({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - تم تحويل لصاحب الايبان | ${iban}

 - بأسم | ${data.id.first}

 - المبلغ | ${money}

 - Maze Bank .**`)],
                    components: [],

                })

                interaction.user.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - ايصال تحويل 

 - تم التحويل لصاحب الايبان | ${iban}

 - بمبلغ | ${money}

 - بأسم | ${data.id.first}

 - Maze Bank .**`)]
                }).catch(() => null)

                let member = interaction.guild.members.cache.get(user)
                if (member) {
                    member.send({
                        embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - حوالة واردة 

 - عزيزي | ${db.id.first}

 - تم تحويل ( ${money} ) من قبل | ${data.id.first}

 - Maze Bank .**`)]
                    })
                }


                let log = await guildBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
                if (!log || !log.bank_log) return;

                let ch = interaction.guild.channels.cache.get(log.bank_log)
                if (!ch) return;

                ch.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - تم اتمام عملية تحويل من قبل | ${interaction.user}

 - المستلم | <@${user}>

 - المبلغ | ${money}

   .**`)]
                })
            }

        } else if (interaction.customId.startsWith("cancel")) {
            let v = interaction.customId.split("_")[1]

            interaction.update({
                components: [],
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - تم إلغاء عملية ${v === "addMoney" ? "الايداع" : v === "getMoney" ? "السحب" : "التحويل"} بنجاح**`)]
            })
        }
    }
};