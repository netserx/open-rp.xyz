const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { builds } = require('../../builds.json')
    , userBase = require('../../Models/userBase')
    , { invLog } = require("../../config.json");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("houseActions")) {
            const choice = interaction.customId.split("_")[1]
                , value = interaction.customId.split("_")[2]
                , user = interaction.customId.split("_")[3]

            if (interaction.user.id != user) return;

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

            if (choice === "add") {
                if (data.inv.length <= 0) return interaction.reply({
                    content: `:x: | ليس لديك أغراض في الحقيبة لتخزينها`,
                    ephemeral: true
                })

                const build = data.builds[value]

                var total = 0
                build.safe.forEach(item => total += item.count)

                if (total >= build.storage) return interaction.reply({
                    content: `:x: | وصلت للحد الاقصى لسعة المخزن الخاص بمنزلك`,
                    ephemeral: true
                })

                const allinvs = [], inv = [...data.inv.sort((a, b) => b.count - a.count)];

                if (inv.length <= 0) return interaction.reply({
                    content: `:x: | الشخصية ${check.character === "c1" ? "الاولى" : "الثانية"} لا تملك اغراض داخل الحقيبة`,
                    ephemeral: true,
                    components: []
                })

                while (inv.length) {
                    allinvs.push(inv.splice(0, 25));
                }

                const rows = [];
                for (let i = 0; i < allinvs.length; i++) {
                    rows.push(new Discord.ActionRowBuilder().addComponents(
                        new Discord.StringSelectMenuBuilder()
                            .setCustomId(`selectInv_${i}`)
                            .setMaxValues(allinvs[i].length)
                            .setPlaceholder("Choose item from your inv")
                            .addOptions(allinvs[i].map(item => {
                                return { label: `${item.name}`, value: `${item.name}` }
                            }))
                    ));
                }

                rows.push(new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId(`actionHouseSuccess`)
                        .setLabel("Done")
                        .setStyle("Success")
                ))

                await interaction.reply({
                    components: rows,
                    ephemeral: true
                })
            } else if (choice === "cars") {
                const build = data.builds[value]

                if (build.cars.length <= 0) return interaction.reply({
                    content: `:x: | هذا البيت لا يمتلك سيارات داخل الكراج`,
                    ephemeral: true
                })

                const allcars = [], cars = [...build.cars];

                while (cars.length) {
                    allcars.push(cars.splice(0, 1));
                }

                function generateEmbed(page) {
                    let embed = new Discord.EmbedBuilder()
                        .setColor("#003d66")
                        .setImage(`${allcars[page][0].image}`)
                        .setDescription(`**🏠 - Carage : ${build.name}

 - Car Name : ${allcars[page][0].name}

 - Car Price : ${allcars[page][0].price.toLocaleString("en-US")}

  — Type of car
Off-Rode/On-Rode : ${allcars[page][0].rode ? "On" : "Off"}-Rode**`)

                    return embed;
                }

                var currentPage = 0;
                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId("back")
                        .setStyle("Secondary")
                        .setLabel("back")
                        .setDisabled(currentPage == 0),

                    new Discord.ButtonBuilder()
                        .setCustomId("next")
                        .setStyle("Secondary")
                        .setDisabled(data.cars.length <= 1)
                        .setLabel("next")
                )

                let msg = await interaction.user.send({
                    embeds: [generateEmbed(currentPage)],
                    components: [row],
                    ephemeral: true
                }).catch(() => {
                    return interaction.reply({
                        content: `:x: | تعذر إرسال السيارات في الخاص ، تأكد من فتح خاصك وحاول مرة آخرى`,
                        ephemeral: true
                    })
                })

                interaction.reply({
                    content: `:white_check_mark: | تم إرسال السيارات في الخاص`,
                    ephemeral: true
                })

                const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 999999 });
                collector.on('collect', async (i2) => {
                    if (i2.user.id != interaction.user.id) return;

                    if (i2.customId === 'back' || i2.customId === 'next') { await i2.deferUpdate() }

                    if (i2.customId === 'back') {
                        currentPage -= 1;

                        if (currentPage < 0) currentPage = allcars.length - 1;
                    } else if (i2.customId === 'next') {
                        currentPage += 1;

                        if (currentPage === allcars.length) currentPage = 0;
                    }

                    await row.components[0].setDisabled(currentPage === 0);
                    await row.components[1].setDisabled(currentPage === allcars.length - 1);

                    await msg.edit({
                        ephemeral: true,
                        embeds: [generateEmbed(currentPage)],
                        components: [row]
                    });
                });
            }


        }
    }
};
