const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { cars } = require('../../cars.json')
    , userBase = require('../../Models/userBase')
    , { invLog } = require("../../config.json");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("bbcar")) {
            const value = interaction.customId.split("_")[1]
                , car = cars[interaction.customId.split("_")[2]]
                , house = interaction.customId.split("_")[3]

            if (value === "confirm") {
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

                data.cars.push(car)
                data.builds[house].cars.push(car)
                data.cash -= Number(car.price)
                await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                    {
                        $set: {
                            [`${check.character}`]: data
                        }
                    }
                );

                await interaction.update({
                    components: [],
                    ephemeral: true,
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Car Successfully Bought**`)]
                })

                let channel = interaction.guild.channels.cache.get(invLog)
                if (!channel) return;

                channel.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** الشخصية | ${check.character === "c1" ? "الاولى" : "الثانية"}

 - العضو | ${interaction.user}

 - السيارة | ${car.name}

 - بسعر | ${car.price}

  .**`)]
                })
            } else {
                interaction.update({
                    components: [],
                    ephemeral: true,
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Car Successfully Canceled**`)]
                })
            }
        }
    }
};
