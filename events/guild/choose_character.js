const Discord = require('discord.js'),
    guildBase = require('../../Models/guildBase'),
    userBase = require('../../Models/userBase');

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith("choose_character")) {
            let db = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
            if (!db) {
                db = new userBase({ guild: interaction.guild.id, user: interaction.user.id });
                await db.save();
            }

            db = db[interaction.values[0]];

            if (db.id && db.id.accepted === false) return interaction.reply({
                content: `:x: | لديك هوية قيد المراجعة`,
                ephemeral: true
            });

            if (!db.id || Object.keys(db.id).length <= 0) {
                const modal = new Discord.ModalBuilder()
                    .setCustomId(`createId_${interaction.values[0]}`)
                    .setTitle('Create a new Id');

                const firstName = new Discord.TextInputBuilder()
                    .setCustomId('first_name')
                    .setLabel("What's your first name")
                    .setStyle("Short");

                const lastName = new Discord.TextInputBuilder()
                    .setCustomId('last_name')
                    .setLabel("What's your last name")
                    .setStyle("Short");

                const brithDay = new Discord.TextInputBuilder()
                    .setCustomId('birthday')
                    .setLabel("What's your birthday")
                    .setStyle("Short");

                const brithPlace = new Discord.TextInputBuilder()
                    .setCustomId('birthplace')
                    .setLabel("What's your brith place")
                    .setStyle("Short");

                const gender = new Discord.TextInputBuilder()
                    .setCustomId('gender')
                    .setLabel("What's your gender")
                    .setStyle("Short");

                const row1 = new Discord.ActionRowBuilder().addComponents(firstName);
                const row2 = new Discord.ActionRowBuilder().addComponents(lastName);
                const row3 = new Discord.ActionRowBuilder().addComponents(brithDay);
                const row4 = new Discord.ActionRowBuilder().addComponents(brithPlace);
                const row5 = new Discord.ActionRowBuilder().addComponents(gender);

                modal.addComponents(row1, row2, row3, row4, row5);

                interaction.message.edit({ components: interaction.message.components });
                await interaction.showModal(modal);
            } else {
                let data = await guildBase.findOne({ guild: interaction.guild.id });
                if (!data) {
                    data = new guildBase({ guild: interaction.guild.id });
                    await data.save();
                }

                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`** - First Name | ${db.id.first}

 - Last Name | ${db.id.last}

 -  Birthday | ${db.id.date}

 - Brith Place | ${db.id.place} 

 - GENDER | ${db.id.gender}**`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp();

                let embed2 = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`**:x: | الاقيام مقفلة في الوقت الحالي**`);

                if (!data.game) {
                    interaction.message.edit({ components: interaction.message.components });
                    return interaction.reply({
                        embeds: [embed2, embed],
                        ephemeral: true
                    });
                } else {
                    let check = data.joins.find(c => c.user === interaction.user.id);

                    if (check) {
                        const oneMinute = 60 * 1000;
                        const now = Date.now();

                        if (now - (check.timestamp || 0) < oneMinute) {
                            interaction.message.edit({ components: interaction.message.components });
                            return interaction.reply({
                                embeds: [embed2.setDescription(`**:x: | لقد قمت بتسجيل الدخول مسبقًا. يمكنك تغيير شخصيتك بعد دقيقة.**`), embed],
                                ephemeral: true
                            });
                        }

                        check.character = interaction.values[0];
                        check.timestamp = now;

                        let ch = interaction.guild.channels.cache.get(data.game_channels?.join);
                        if (!ch) {
                            return interaction.reply({
                                content: `:x: | تعذر تبديل شخصيتك بسبب عدم إيجاد روم التسجيلات`,
                                ephemeral: true
                            });
                        }

                        let eembedd = new Discord.EmbedBuilder()
                            .setColor("#003d66")
                            .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                            .setDescription(`** - Changed to Character Number | ${interaction.values[0] === "c1" ? "1" : "2"}

 - First Name | ${db.id.first}

 - Last Name | ${db.id.last}**`);

                        await ch.send({ embeds: [eembedd] });
                        await data.save();

                        interaction.message.edit({ components: interaction.message.components });
                        return interaction.reply({
                            embeds: [embed2.setDescription(`**:white_check_mark: | تم تبديل شخصيتك بنجاح**`), embed],
                            ephemeral: true
                        });
                    }

                    if (!data.game_channels) return interaction.reply({
                        content: `:x: | تعذر تسجيل دخولك بسبب عدم تعيين رومات الاقيام`,
                        ephemeral: true
                    });

                    let ch = interaction.guild.channels.cache.get(data.game_channels.join);
                    if (!ch) return interaction.reply({
                        content: `:x: | تعذر تسجيل دخولك بسبب عدم إيجاد روم التسجيلات`,
                        ephemeral: true
                    });

                    let eembedd = new Discord.EmbedBuilder()
                        .setColor("#003d66")
                        .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                        .setDescription(`** - Sign in Character Number | ${interaction.values[0] === "c1" ? "1" : "2"}

 - First Name | ${db.id.first}

 - Last Name | ${db.id.last}**`);

                    ch.send({
                        embeds: [eembedd]
                    });

                    data.joins.push({
                        user: interaction.user.id,
                        character: interaction.values[0],
                        timestamp: Date.now()
                    });
                    await data.save();

                    interaction.message.edit({ components: interaction.message.components });
                    await interaction.reply({
                        embeds: [embed2.setDescription(`**:white_check_mark: | تم تسجيل دخولك بنجاح**`), embed],
                        ephemeral: true
                    });
                }
            }
        }
    }
};
