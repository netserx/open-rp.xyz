const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
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
    return { prices: {}, names: {}, emojis: {}, invLog: null };
  }
}

module.exports = {
  name: `interactionCreate`,
  run: async (interaction, client) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith("buy")) {
      let parts = interaction.customId.split("_");
      let action = parts[1];

      // تحميل البيانات من الثلاثة ملفات
      const configData = loadJSON(configPath);
      const dealerData = loadJSON(dealerPath);
      const policeData = loadJSON(policePath);

      // دمج الأسعار والأسماء
      const prices = { ...configData.prices, ...dealerData.prices, ...policeData.prices };
      const names = { ...configData.names, ...dealerData.names, ...policeData.names };
      const invLog = configData.invLog; // لوج بيكون في config.json

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

      if (action === "cancel") {
        await interaction.update({
          components: [],
          embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Your progress has been canceled**`)]
        });
      } else if (action === "confirm") {
        let total = parts[2];
        let encodedValues = parts.slice(3).join("_");
        let values = decodeURIComponent(encodedValues).split(",");

        // فلترة العناصر غير الموجودة في أي من الملفات
        values = values.filter(v => names[v] && prices[v]);

        if (values.length === 0) {
          return interaction.update({
            components: [],
            content: `:x: | لم أجد أي عنصر صالح للشراء.`
          });
        }

        let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
        if (!data) {
          data = new userBase({ guild: interaction.guild.id, user: interaction.user.id });
          await data.save();
        }

        data = data[check.character];

        if (data.cash < Number(total)) {
          return interaction.update({
            components: [],
            embeds: [],
            content: `:x: | كاشك أقل من سعر المنتجات`
          });
        }

        data.cash -= Number(total);

        if (!data.inv) data.inv = [];

        values.forEach(value => {
          let itemName = names[value];
          let invItem = data.inv.find(c => c.name && c.name.toLowerCase() === itemName.toLowerCase());
          if (invItem) {
            invItem.count += 1;
          } else {
            data.inv.push({ name: itemName, count: 1 });
          }
        });

        await userBase.updateOne(
          { guild: interaction.guild.id, user: interaction.user.id },
          { $set: { [`${check.character}`]: data } }
        );

        await interaction.update({
          embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Your progress successfully completed**`)],
          components: []
        });

        let channel = interaction.guild.channels.cache.get(invLog);
        if (!channel) return;

        channel.send({
          embeds: [new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setDescription(`** الشخصية | ${check.character === "c1" ? "الاولى" : "الثانية"}

 - العضو | ${interaction.user}

 - تم شراء | ${values.map(c => names[c]).join(" - ")}

 - بسعر | ${total}

  .**`)
          ]
        });
      }
    }
  }
};
