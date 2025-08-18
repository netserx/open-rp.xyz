const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { builds } = require('../../builds.json')
    , userBase = require('../../Models/userBase')
    , { invLog } = require("../../config.json");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("buildBuy_")) {
            const value = interaction.customId.split("_")[1]
                , build = builds[value];
            Object.assign(build, {
                cars: [],
                safe: [],
            });

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

            let house_check = data.builds.find(c => c.name.toLowerCase() === build.name.toLowerCase())
            if (house_check) return interaction.update({
                content: `:x: | لقد قمت بشراء هذا العقار من قبل`,
                ephemeral: true,
                components: [],
                embeds: []
            })

            if (data.cash < Number(build.price)) return interaction.reply({
                content: `:x: | رصيدك الكاش أقل من سعر العقار`,
                ephemeral: true
            })

            data.builds.push(build)
            data.cash -= Number(build.price)
            await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                {
                    $set: {
                        [`${check.character}`]: data
                    }
                }
            );

            interaction.update({
                components: [],
                ephemeral: true,
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - House Successfully Bought**`)]
            })

            let channel = interaction.guild.channels.cache.get(invLog)
            if (!channel) return;

            channel.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** الشخصية | ${check.character === "c1" ? "الاولى" : "الثانية"}

 - العضو | ${interaction.user}

 - البيت | ${build.name}

 - بسعر | ${build.price}

 .**`)]
            })
        }
    }
};
