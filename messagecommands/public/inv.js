const userBase = require('../../Models/userBase'),
      guildBase = require('../../Models/guildBase'),
      Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

// مسارات الملفات
const configPath = path.join(__dirname, '../../config.json');
const dealerPath = path.join(__dirname, '../../dealer.json');
const policePath = path.join(__dirname, '../../police.json');

function loadJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
        console.error(`Error loading ${filePath}:`, err);
        return {};
    }
}

// تحميل كل الداتا (emojis + names)
function loadAllConfigs() {
    const config = loadJson(configPath);
    const dealer = loadJson(dealerPath);
    const police = loadJson(policePath);

    return {
        emojis: { ...(config.emojis || {}), ...(dealer.emojis || {}), ...(police.emojis || {}) },
        names: { ...(config.names || {}), ...(dealer.names || {}), ...(police.names || {}) }
    };
}

module.exports = {
    name: `inv`,
    aliases: ["حقيبتي"],
    run: async (client, ctx, args) => {
        const isInteraction = !!ctx.isButton;
        const guildId = ctx.guild.id;
        const userId = isInteraction ? ctx.user.id : ctx.author.id;

        // جلب بيانات السيرفر
        let db = await guildBase.findOne({ guild: guildId });
        if (!db) {
            db = new guildBase({ guild: guildId });
            await db.save();
        }

        let check = db.joins.find(c => c.user === userId);
        if (!check) {
            return ctx.reply({ content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام هذا الامر`, ephemeral: isInteraction });
        }

        let data = await userBase.findOne({ guild: guildId, user: userId });
        if (!data) {
            data = new userBase({ guild: guildId, user: userId });
            await data.save();
        }

        data = data[check.character];

        if (data.clamped) {
            return ctx.reply({ content: `** - انت مكلبش لايمكنك استخدام هذا الامر**`, ephemeral: isInteraction });
        }

        const allinvs = [], max = 5, inv = [...data.inv.sort((a, b) => b.count - a.count)];

        if (inv.length <= 0) {
            return ctx.reply({ content: `:x: | الشخصية ${check.character === "c1" ? "الاولى" : "الثانية"} لا تملك اغراض داخل الحقيبة`, ephemeral: isInteraction });
        }

        while (inv.length) {
            allinvs.push(inv.splice(0, max));
        }

        // نقرأ من التلاتة ملفات
        const { emojis, names } = loadAllConfigs();

        // محاولة إيجاد الـ key (سواء الاسم الأصلي أو الاسم المترجم)
        function findKeyByName(name) {
            if (emojis[name] || names[name]) return name;
            const entry = Object.entries(names).find(([key, value]) => value === name);
            return entry ? entry[0] : name;
        }

        function generateEmbed(page) {
            return new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setThumbnail(ctx.guild.iconURL({ dynamic: true }))
                .setDescription(`** - Name | ${data.id.first}

${allinvs[page].map((value, i) => {
    const key = findKeyByName(value.name);
    const emoji = emojis[key] ? `${emojis[key]} ` : "";
    const displayName = names[key] || value.name;
    return `${i + 1} | ${emoji}${displayName}\n- Amount | ${value.count}`;
}).join("\n\n")}**`);
        }

        let currentPage = 0;
        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("back_inv")
                .setStyle(Discord.ButtonStyle.Secondary)
                .setLabel("◀ Back")
                .setDisabled(currentPage === 0),
            new Discord.ButtonBuilder()
                .setCustomId("next_inv")
                .setStyle(Discord.ButtonStyle.Secondary)
                .setLabel("Next ▶")
                .setDisabled(allinvs.length <= 1)
        );

        const msg = await ctx.reply({ 
            embeds: [generateEmbed(currentPage)], 
            components: [row], 
            fetchReply: true 
        });

        const collector = msg.createMessageComponentCollector({ 
            componentType: Discord.ComponentType.Button, 
            time: 120000 
        });

        collector.on('collect', async (i2) => {
            if (i2.user.id !== userId) return i2.reply({ content: ":x: هذا الزر ليس لك", ephemeral: true });

            if (i2.customId === 'back_inv') {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (i2.customId === 'next_inv') {
                currentPage = Math.min(currentPage + 1, allinvs.length - 1);
            }

            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === allinvs.length - 1);

            await i2.update({
                embeds: [generateEmbed(currentPage)],
                components: [row]
            });
        });

        collector.on('end', async () => {
            row.components.forEach(btn => btn.setDisabled(true));
            await msg.edit({ components: [row] }).catch(() => {});
        });
    }
};
