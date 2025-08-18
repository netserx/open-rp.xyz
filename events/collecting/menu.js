const Discord = require('discord.js'),
    guildBase = require('../../Models/guildBase'),
    userBase = require('../../Models/userBase'),
    weapon_levels = require("../../weapons.json");

// إيموجيات المواد
const materialEmojis = {
    Aluminium: "🛠️",
    Iron: "⛓️",
    Gunpowder: "💥",
    Plastic: "🔹"
};

// دالة مساعدة لإرجاع الإيموجي لكل مادة
const getEmoji = (material) => materialEmojis[material] || material;

const orders = {
    "1": [
        { name: "Aluminium", count: 1 },
        { name: "Iron", count: 1 },
        { name: "Gunpowder", count: 1 },
        { name: "Plastic", count: 1 },
    ],
    "2": [
        { name: "Aluminium", count: 210 },
        { name: "Iron", count: 98 },
        { name: "Gunpowder", count: 76 },
        { name: "Plastic", count: 111 },
    ],
    "3": [
        { name: "Aluminium", count: 370 },
        { name: "Iron", count: 211 },
        { name: "Gunpowder", count: 140 },
        { name: "Plastic", count: 120 },
    ],
    "4": [
        { name: "Aluminium", count: 390 },
        { name: "Iron", count: 279 },
        { name: "Gunpowder", count: 160 },
        { name: "Plastic", count: 140 },
    ],
    "5": [
        { name: "Aluminium", count: 510 },
        { name: "Iron", count: 310 },
        { name: "Gunpowder", count: 175 },
        { name: "Plastic", count: 160 },
    ],
};

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith("mach_menu")) {
            let value = interaction.values[0];
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

            let ban_check = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
            if (!ban_check) {
                ban_check = new userBase({ guild: interaction.guild.id, user: interaction.user.id });
                await ban_check.save();
            }

            ban_check = ban_check[check.character];
            if (ban_check.clamped) return interaction.reply({
                ephemeral: true,
                content: `** - انت مكلبش لايمكنك التجميع**`
            });

            if (value === "collecting") {
                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId(`acollect_all`)
                        .setLabel("Start Collecting All")
                        .setStyle("Success"),
                    new Discord.ButtonBuilder()
                        .setCustomId(`acollect_cancel`)
                        .setLabel("Cancel")
                        .setStyle("Danger")
                );

                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setImage("https://i.imgur.com/FMtpsIp.jpeg")
                    .setDescription(`** - Click (Start Collecting All) to gather all resources.**`);

                interaction.message.edit({ components: interaction.message.components });
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                    components: [row]
                });
            } else if (value === "upgrade") {
                if (!db.levels) return interaction.update({
                    content: `:x: | تعذر عملية التطوير بسبب عدم تعيين رتب التطويرات`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });

                const options = [];
                for (let level = 1; level <= 5; level++) {
                    if (!interaction.member.roles.cache.get(db.levels[level])) {
                        options.push({ label: `Level ${level}`, value: `${level}` });
                        break;
                    } else if (level === 5) {
                        return interaction.reply({
                            content: `:x: | وصلت للحد الاقصى من التطويرات.`,
                            ephemeral: true
                        });
                    }
                }

                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId(`levels_menu`)
                        .setMaxValues(1)
                        .setPlaceholder("Choose a level you want to upgrade")
                        .addOptions(options)
                );

                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`** - Choose the level .**`);

                interaction.message.edit({ components: interaction.message.components });
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                    components: [row]
                });
            } else if (value === "manufacturing") {
                if (!db.levels) return interaction.update({
                    content: `:x: | تعذر عملية التطوير بسبب عدم تعيين رتب التطويرات`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });

                const userRoles = interaction.member.roles.cache.map(role => role.id);
                const check_roles = Object.values(db.levels).some(roleId => userRoles.includes(roleId));
                if (!check_roles) {
                    interaction.message.edit({ components: interaction.message.components });
                    return interaction.reply({
                        content: ":x: | أنت لا تمتلك أي تطويرات حتى الان",
                        embeds: [],
                        components: [],
                        ephemeral: true
                    });
                }

                const options = [];
                for (let level = 1; level <= 5; level++) {
                    if (interaction.member.roles.cache.get(db.levels[level])) {
                        options.push({ label: `Level ${level}`, value: `${level}` });
                    }
                }

                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId(`weaponlevels_menu`)
                        .setMaxValues(1)
                        .setPlaceholder("Choose a level you want to upgrade")
                        .addOptions(options)
                );

                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`** - Choose the level .**`);

                interaction.message.edit({ components: interaction.message.components });
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                    components: [row]
                });
            }
        }

        if (interaction.customId.startsWith("weaponlevels_menu")) {
            let value = interaction.values[0];
            let db = await guildBase.findOne({ guild: interaction.guild.id });
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id });
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id);
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام التصنيع`,
                ephemeral: true
            });

            let ban_check = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
            if (!ban_check) {
                ban_check = new userBase({ guild: interaction.guild.id, user: interaction.user.id });
                await ban_check.save();
            }

            ban_check = ban_check[check.character];
            if (ban_check.clamped) return interaction.reply({
                ephemeral: true,
                content: `** - انت مكلبش لايمكنك التصنيع**`
            });

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId(`weapons_${value}`)
                    .setMaxValues(1)
                    .setPlaceholder("Choose a weapon you want to manufacture")
                    .addOptions(weapon_levels[value].map((c, i) => {
                        return { label: `${c.name}`, value: `${i}` };
                    }))
            );

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** - Choose the weapon**`);

            await interaction.update({
                embeds: [embed],
                ephemeral: true,
                components: [row]
            });
        }

        if (interaction.customId.startsWith("weapons")) {
            let value = interaction.values[0];
            let index = interaction.customId.split("_")[1];
            const weapon = weapon_levels[index][value];

            let db = await guildBase.findOne({ guild: interaction.guild.id });
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id });
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id);
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام التصنيع`,
                ephemeral: true
            });

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`manufacture_success_${index}_${value}`)
                    .setLabel("Manufacturing")
                    .setStyle("Success"),
                new Discord.ButtonBuilder()
                    .setCustomId(`manufacture_cancel`)
                    .setLabel("Cancel")
                    .setStyle("Danger")
            );

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage(`${weapon.image}`)
                .setDescription(`**Weapons | ${weapon.name}

 ${getEmoji("Aluminium")} Aluminium
Number | ${weapon.Aluminium}

 ${getEmoji("Iron")} Iron
Number | ${weapon.Iron}

 ${getEmoji("Gunpowder")} Gunpowder
Number | ${weapon.Gunpowder}

 ${getEmoji("Plastic")} Plastic
Number | ${weapon.Plastic}**`);

            await interaction.update({
                embeds: [embed],
                ephemeral: true,
                components: [row]
            });
        }
    }
};
