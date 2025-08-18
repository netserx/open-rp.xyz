const Discord = require('discord.js'),
    guildBase = require('../../Models/guildBase'),
    userBase = require('../../Models/userBase'),
    users = new Map(),
    weapons = require("../../weapons.json");

// إيموجيات لكل مورد
const emojis = {
    Aluminium: "🛠️",
    Gunpowder: "💥",
    Plastic: "🔹",
    Iron: "⛓️"
};

// التحقق من الموارد المطلوبة
function checkInv(items, inv) {
    return items.every(item => {
        const itemInInv = inv.find(invItem => invItem.name.toLowerCase() === item.name.toLowerCase());
        return itemInInv && itemInInv.count >= item.count;
    });
}

// دالة لإنشاء embed
function createEmbed(description, color = "#003d66", image) {
    const embed = new Discord.EmbedBuilder()
        .setColor(color)
        .setDescription(description);
    if (image) embed.setImage(image);
    return embed;
}

module.exports = {
    users,
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (!interaction.customId.startsWith("manufacture")) return;

        const choice = interaction.customId.split("_")[1];
        let db = await guildBase.findOne({ guild: interaction.guild.id });
        if (!db) {
            db = new guildBase({ guild: interaction.guild.id });
            await db.save();
        }

        const check = db.joins.find(c => c.user === interaction.user.id);
        if (!check) return interaction.reply({
            content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام تصنيع`,
            ephemeral: true
        });

        // إلغاء التصنيع
        if (choice === "cancel") {
            users.delete(interaction.user.id);
            return interaction.update({
                embeds: [createEmbed(`** - Manufacturing canceled successfully.**`)],
                ephemeral: true,
                components: []
            });
        }

        // نجاح التصنيع
        if (choice === "success") {
            const index = interaction.customId.split("_")[2],
                value = interaction.customId.split("_")[3];

            const weapon = weapons[index][value];
            const order = [
                { name: "Aluminium", count: weapon.Aluminium },
                { name: "Iron", count: weapon.Iron },
                { name: "Gunpowder", count: weapon.Gunpowder },
                { name: "Plastic", count: weapon.Plastic }
            ];

            if (users.has(interaction.user.id)) return interaction.update({
                content: `:x: | لديك عملية تصنيع بالفعل`,
                ephemeral: true,
                components: [],
                embeds: []
            });

            let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
            data = data[check.character];

            if (!checkInv(order, data.inv)) return interaction.update({
                content: `:x: | لا تمتلك الاغراض المطلوبة`,
                ephemeral: true,
                components: [],
                embeds: []
            });

            users.set(interaction.user.id, true);

            // رسالة الانتظار
            await interaction.update({
                embeds: [createEmbed(`** - Please wait until the manufacturing is complete.**`, "#003d66", "https://i.imgur.com/LGcsHp8.jpeg")],
                ephemeral: true,
                components: []
            });

            // خصم الموارد
            order.forEach(item => {
                const ind = data.inv.findIndex(c => c.name.toLowerCase() === item.name.toLowerCase());
                if (ind !== -1) {
                    data.inv[ind].count === item.count ? data.inv.splice(ind, 1) : data.inv[ind].count -= item.count;
                }
            });

            // إضافة السلاح الجديد
            const ind2 = data.inv.findIndex(c => c.name.toLowerCase() === weapon.name.toLowerCase());
            ind2 === -1 ? data.inv.push({ name: weapon.name, count: 1 }) : data.inv[ind2].count += 1;

            setTimeout(async () => {
                await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id }, {
                    $set: { [`${check.character}`]: data }
                });

                users.delete(interaction.user.id);

                // رسالة النجاح مع إيموجيات الموارد
                const resourceList = order.map(item => `${emojis[item.name]} ${item.name} x${item.count}`).join("\n");

                interaction.editReply({
                    embeds: [createEmbed(`** - You successfully manufactured ( ${weapon.name} )!**\n\n**Resources used:**\n${resourceList}`)],
                    ephemeral: true,
                    components: []
                });

                // سجل التصنيع في القناة المحددة
                if (db.make_log) {
                    const log = interaction.guild.channels.cache.get(db.make_log);
                    if (log) {
                        log.send({
                            embeds: [createEmbed(`** Manufacturing Log **\n\n- الشخص | ${interaction.user}\n- السلاح | ${weapon.name}\n- الموارد المستخدمة:\n${resourceList}\n- الشخصية | ${check.character === "c1" ? "1" : "2"}`)]
                        });
                    }
                }

            }, 6000);
        }
    }
};
