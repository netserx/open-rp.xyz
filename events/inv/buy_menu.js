const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const guildBase = require('../../Models/guildBase');
const userBase = require('../../Models/userBase');

const configPath = path.join(__dirname, '../../config.json');
const dealerPath = path.join(__dirname, '../../dealer.json');
const policePath = path.join(__dirname, '../../police.json');

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err);
    return { prices: {}, names: {}, emojis: {} };
  }
}

module.exports = {
  name: `interactionCreate`,
  run: async (interaction, client) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId.startsWith("buy_menu")) {
      // نقرأ الملفات الثلاثة
      const configData = loadJSON(configPath);
      const dealerData = loadJSON(dealerPath);
      const policeData = loadJSON(policePath);

      // ندمجهم
      const prices = { ...configData.prices, ...dealerData.prices, ...policeData.prices };
      const names = { ...configData.names, ...dealerData.names, ...policeData.names };
      const emojis = { ...configData.emojis, ...dealerData.emojis, ...policeData.emojis };

      const values = interaction.values;

      let db = await guildBase.findOne({ guild: interaction.guild.id });
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id });
        await db.save();
      }

      let check = db.joins.find(c => c.user === interaction.user.id);
      if (!check) return interaction.reply({
        content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام المتجر`,
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
        content: `** - انت مكلبش لايمكنك استخدام المتجر**`
      });

      // تحقق من أن كل القيم موجودة في أي واحد من الملفات
      const invalidItems = values.filter(value => !(value in prices));
      if (invalidItems.length > 0) {
        return interaction.reply({
          ephemeral: true,
          content: `❌ العناصر التالية غير متوفرة في الأسعار: ${invalidItems.join(", ")}`
        });
      }

      const total = values.reduce((acc, val) => acc + prices[val], 0);
      const encodedValues = encodeURIComponent(values.join(","));

      let row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId(`buy_confirm_${total}_${encodedValues}`)
          .setStyle(Discord.ButtonStyle.Success)
          .setLabel("شراء"),
        new Discord.ButtonBuilder()
          .setCustomId(`buy_cancel`)
          .setStyle(Discord.ButtonStyle.Danger)
          .setLabel("إلغاء")
      );

      const embed = new Discord.EmbedBuilder()
        .setColor("#003d66")
        .setAuthor({ name: "فاتورة الشراء" })
        .addFields(
          values.map(value => ({
            name: `${emojis?.[value] || ''} ${names[value] || value}`,
            value: `${prices[value]}$`,
            inline: true
          }))
        )
        .addFields({ name: "الإجمالي", value: `${total}$`, inline: false });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
        components: [row]
      });
    }
  }
};
