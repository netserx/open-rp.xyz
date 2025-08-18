const Discord = require('discord.js');
const userBase = require('../../Models/userBase');
const guildBase = require('../../Models/guildBase');
const fs = require('fs');
const { names } = require("../../config.json");

const thefts = JSON.parse(fs.readFileSync('./thefts.json', 'utf8')).thefts;

function getItemKeyFromName(name) {
  if (names[name]) return name;
  const found = Object.entries(names).find(
    ([key, display]) => display.toLowerCase() === name.toLowerCase() || display === name
  );
  if (found) return found[0];
  return name;
}

function matchItem(item, keyName) {
  return (
    (item.itemKey && item.itemKey.toLowerCase() === keyName.toLowerCase()) ||
    (item.name && names[keyName] && item.name.toLowerCase() === names[keyName].toLowerCase())
  );
}

function parseItem(itemStr) {
  let count = 1;
  let name = itemStr;

  if (/^\$/.test(itemStr)) {
    return { type: "money", amount: parseInt(itemStr.replace(/\$/, '')) };
  }

  const match = itemStr.match(/^(\d+)\s+(.*)$/);
  if (match) {
    count = parseInt(match[1]);
    name = match[2].trim();
  }

  const keyName = getItemKeyFromName(name);
  return { type: "item", keyName, name, count };
}

const createProgressBar = (progress) => {
  const total = 20;
  const filled = Math.round(progress / 100 * total);
  return `[${'█'.repeat(filled)}${'░'.repeat(total - filled)}] ${progress}%`;
};

module.exports = {
  name: `interactionCreate`,
  run: async (interaction, client) => {
    if (interaction.isStringSelectMenu() && interaction.customId === "select_theft_type") {
      const selected = interaction.values[0];
      const theft = thefts.find(t => t.name === selected);

      if (!theft) return interaction.reply({ content: ":x: | هذا النوع من السرقة غير موجود.", ephemeral: true });

      const row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId(`theft_start_${interaction.user.id}_c1_${theft.name}`)
          .setLabel("🧍 الشخصية الأولى")
          .setStyle("Primary"),
        new Discord.ButtonBuilder()
          .setCustomId(`theft_start_${interaction.user.id}_c2_${theft.name}`)
          .setLabel("🧍‍♂️ الشخصية الثانية")
          .setStyle("Primary")
      );

      return interaction.reply({
        content: `🕵️ | اختر الشخصية التي تريد تنفيذ السرقة بها لسرقة **${theft.name}**`,
        components: [row],
        ephemeral: true
      });
    }

    if (interaction.isButton() && interaction.customId.startsWith("theft_start_")) {
      const [, , userId, charKey, theftName] = interaction.customId.split("_");
      if (interaction.user.id !== userId) {
        return interaction.reply({ content: ":x: | هذا الزر ليس لك!", ephemeral: true });
      }

      const theft = thefts.find(t => t.name === theftName);
      if (!theft) return interaction.reply({ content: ":x: | السرقة غير موجودة.", ephemeral: true });

      let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
      if (!data) {
        data = new userBase({ guild: interaction.guild.id, user: interaction.user.id, c1: { inv: [] }, c2: { inv: [] } });
        await data.save();
      }

      let character = data[charKey];

      const check = (wants) => {
        return wants.every(w => {
          const parsed = parseItem(w);
          if (parsed.type === "money") return true;
          return character.inv.some(item => matchItem(item, parsed.keyName) && (item.count || 1) >= parsed.count);
        });
      };

      if (!check(theft.wants)) {
        return interaction.reply({
          content: `:x: | شخصيتك لا تملك جميع الأغراض المطلوبة:\n${theft.wants.join("\n")}\n`,
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      let progress = 0;
      await interaction.editReply({ content: createProgressBar(progress) });

      const interval = setInterval(async () => {
        progress += 50;
        if (progress >= 100) {
          clearInterval(interval);

          const lootResults = [];

          const moneyItems = theft.add.filter(item => /^\$/.test(item));
          const itemItems = theft.add.filter(item => !/^\$/.test(item));

          const safesCount = theft.safes || 3; // لو مش موجود safes نعتبرها 3 خزائن

          for (let i = 0; i < safesCount; i++) {
            const isMoneyRun = Math.random() < 0.9; // 90% فلوس
            const sourceArray = isMoneyRun ? moneyItems : itemItems;

            if (sourceArray.length === 0) continue;

            const randomItem = sourceArray[Math.floor(Math.random() * sourceArray.length)];
            const parsed = parseItem(randomItem);

            if (parsed.type === "money") {
              character.bank = (character.bank || 0) + parsed.amount;
              lootResults.push(`💰 ${parsed.amount}`);
            } else {
              const index = character.inv.findIndex(i => matchItem(i, parsed.keyName));
              if (index !== -1) {
                character.inv[index].count = (character.inv[index].count || 1) + parsed.count;
              } else {
                character.inv.push({ itemKey: parsed.keyName, name: parsed.name, count: parsed.count });
              }
              lootResults.push(`📦 ${parsed.name} x${parsed.count}`);
            }
          }

          // إزالة الأغراض المطلوبة
          for (let itemStr of theft.wants) {
            const parsed = parseItem(itemStr);
            if (parsed.type === "item") {
              const index = character.inv.findIndex(i => matchItem(i, parsed.keyName));
              if (index !== -1) {
                if ((character.inv[index].count || 1) <= parsed.count) {
                  character.inv.splice(index, 1);
                } else {
                  character.inv[index].count -= parsed.count;
                }
              }
            }
          }

          await userBase.updateOne(
            { guild: interaction.guild.id, user: interaction.user.id },
            { $set: { [charKey]: character } }
          );

          const config = await guildBase.findOne({ guild: interaction.guild.id });
          if (config?.theftLogChannel && config?.theftMentionRole) {
            const logChannel = interaction.guild.channels.cache.get(config.theftLogChannel);
            if (logChannel) {
              const logMessage =
                `🕵️‍♂️ تمت سرقة **${theft.name}** بواسطة <@${interaction.user.id}> باستخدام الشخصية **${charKey.toUpperCase()}**\n` +
                lootResults.join("\n") +
                `\n<@&${config.theftMentionRole}>`;

              logChannel.send({ content: logMessage }).catch(console.error);
            }
          }

          await interaction.editReply({ content: `✅ | تمت السرقة بنجاح!\n${lootResults.join("\n")}` });

        } else {
          await interaction.editReply({ content: createProgressBar(progress) });
        }
      }, 2000);
    }
  }
};
