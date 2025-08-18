const Discord = require('discord.js'),
    guildBase = require('../../Models/guildBase'),
    userBase = require('../../Models/userBase'),
    users = new Map();

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

function checkInv(items, inv) {
    return items.every(item => {
        const itemInInv = inv.find(invItem => invItem.name.toLowerCase() === item.name.toLowerCase());
        return itemInInv && itemInInv.count >= item.count;
    });
}

module.exports = {
    users,
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("aupgrade")) {
            let value = interaction.customId.split("_")[1];

            let db = await guildBase.findOne({ guild: interaction.guild.id });
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id });
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id);
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام التطوير`,
                ephemeral: true
            });

            if (users.has(interaction.user.id)) return interaction.update({
                content: `:x: | لديك عملية تطوير بالفعل`,
                embeds: [],
                components: [],
                ephemeral: true
            });

            if (!db.levels || !db.levels[value]) return interaction.update({
                content: `:x: | تعذر عملية التطوير بسبب عدم تعيين رتب التطويرات`,
                embeds: [],
                components: [],
                ephemeral: true
            });

            let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
            data = data[check.character];

            if (!checkInv(orders[value], data.inv)) return interaction.update({
                content: `:x: | لا تمتلك الاغراض المطلوبة`,
                embeds: [],
                components: [],
                ephemeral: true
            });

            users.set(interaction.user.id, true);

            // خصم الموارد المطلوبة
            orders[value].forEach(item => {
                let index = data.inv.findIndex(c => c.name.toLowerCase() === item.name.toLowerCase());
                data.inv[index].count === item.count ? data.inv.splice(index, 1) : data.inv[index].count -= item.count;
            });

            // حفظ التغييرات
            await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id }, {
                $set: { [`${check.character}`]: data }
            });

            users.delete(interaction.user.id);

            interaction.update({
                content: `** - You successfully promoted to next level ( ${value} )**`,
                embeds: [],
                components: [],
                ephemeral: true
            });

            // إضافة الرتبة الجديدة
            interaction.member.roles.add(db.levels[value]).catch(() => 0);

            // تسجيل العملية في سجل التطوير
            if (!db.make_log) return;
            let log = interaction.guild.channels.cache.get(db.make_log);
            if (!log) return;

            log.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** Upgrade Log 

 - الشخص | ${interaction.user}

 - التطويرة | Level ${value}

 - الشخصية | ${check.character === "c1" ? "1" : "2"}

\`\`   . \`\`**`)]
            });
        }
    }
};
