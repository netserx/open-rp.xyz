const Discord = require('discord.js'),
    guildBase = require('../../Models/guildBase'),
    userBase = require('../../Models/userBase'),
    users = new Map();

const emojis = {
    Aluminium: "🛠️",
    Gunpowder: "💥",
    Plastic: "🔹",
    Iron: "⛓️"
};

module.exports = {
    users,
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        // التجميع الكلي
        if (interaction.customId === "acollect_all") {
            let db = await guildBase.findOne({ guild: interaction.guild.id });
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id });
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id);
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام التجميع`,
                ephemeral: true
            });

            if (users.has(interaction.user.id)) return interaction.update({
                content: `:x: | لديك عملية تجميع بالفعل`,
                embeds: [],
                components: [],
                ephemeral: true
            });

            users.set(interaction.user.id, true);

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** - Please wait until the collection is complete .**`)
                .setImage("https://i.imgur.com/LGcsHp8.jpeg");

            await interaction.update({
                embeds: [embed],
                ephemeral: true,
                components: []
            });

            const ores = ["Aluminium", "Gunpowder", "Plastic", "Iron"];
            const randomResults = {};
            const random = () => Math.floor(Math.random() * 8) + 1;

            let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
            data = data[check.character];

            ores.forEach(ore => {
                let amount = random();
                randomResults[ore] = amount;
                let index = data.inv.findIndex(c => c.name.toLowerCase() === ore.toLowerCase());
                index === -1 ? data.inv.push({ name: ore, count: amount }) : data.inv[index].count += amount;
            });

            setTimeout(async function () {
                await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id }, {
                    $set: { [`${check.character}`]: data }
                });

                users.delete(interaction.user.id);

                let resultText = Object.entries(randomResults)
                    .map(([name, amt]) => `${emojis[name]} - ${name} | ${amt}`)
                    .join("\n");

                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId(`acollect_all`)
                        .setLabel("Replay All")
                        .setStyle("Success"),
                    new Discord.ButtonBuilder()
                        .setCustomId(`acollect_cancel`)
                        .setLabel("Cancel")
                        .setStyle("Danger")
                );

                interaction.editReply({
                    ephemeral: true,
                    components: [row],
                    embeds: [new Discord.EmbedBuilder()
                        .setColor("#003d66")
                        .setDescription(`** - All collection completed successfully .\n\n${resultText}**`)]
                });

                if (!db.make_log) return;
                let log = interaction.guild.channels.cache.get(db.make_log);
                if (!log) return;

                log.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  Collection Log 

 - الشخص | ${interaction.user}

${resultText}

 - الشخصية | ${check.character === "c1" ? "1" : "2"}

\`\`  . \`\`**`)]
                });
            }, 6000);
        }

        // التجميع الفردي (كما كان)
        if (interaction.customId.startsWith("acollect")) {
            let choice = interaction.customId.split("_")[1];

            let db = await guildBase.findOne({ guild: interaction.guild.id });
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id });
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id);
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام التجميع`,
                ephemeral: true
            });

            if (choice === "start") {
                if (users.has(interaction.user.id)) return interaction.update({
                    content: `:x: | لديك عملية تجميع بالفعل`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });

                users.set(interaction.user.id, true);

                let value = interaction.customId.split("_")[2];

                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`**  - Please wait until the download is complete .**`)
                    .setImage("https://i.imgur.com/LGcsHp8.jpeg");

                interaction.update({
                    embeds: [embed],
                    ephemeral: true,
                    components: []
                }).then(async () => {
                    const random = Math.floor(Math.random() * 8) + 1;

                    let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
                    data = data[check.character];

                    let index = data.inv.findIndex(c => c.name.toLowerCase() === value.toLowerCase());
                    index === -1 ? data.inv.push({ name: value, count: random }) : data.inv[index].count += random;

                    setTimeout(async function () {
                        await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id }, {
                            $set: { [`${check.character}`]: data }
                        });

                        let row = new Discord.ActionRowBuilder().addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`acollect_start_${value}`)
                                .setLabel("Replay")
                                .setStyle("Success"),
                            new Discord.ButtonBuilder()
                                .setCustomId(`acollect_cancel`)
                                .setLabel("Cancel")
                                .setStyle("Danger")
                        );

                        users.delete(interaction.user.id);

                        interaction.editReply({
                            ephemeral: true,
                            components: [row],
                            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Assembly completed successfully .\n\n${emojis[value]} - ${value} | ${random}**`)]
                        });

                        if (!db.make_log) return;
                        let log = interaction.guild.channels.cache.get(db.make_log);
                        if (!log) return;

                        log.send({
                            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  Manufacturing Log 

 - الشخص | ${interaction.user}

 - العنصر | ${value}

 - العدد | ${random}

 - الشخصية | ${check.character === "c1" ? "1" : "2"}

\`\`  . \`\`**`)]
                        });
                    }, 6000);
                });
            }
            else if (choice === "cancel") {
                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`** - Assembly canceled successfully .**`);

                await interaction.update({
                    embeds: [embed],
                    ephemeral: true,
                    components: []
                });

                users.delete(interaction.user.id);
            }
        }
    }
};
