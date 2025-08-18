const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField,
  Colors
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    console.error('Error loading config.json:', err);
    return {};
  }
}

module.exports = {
  name: 'send-message8',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({ content: '❌ ما عندكش صلاحية تستخدم الأمر ده.' });
    }

    const config = loadConfig();
    const prices = config.prices || {};
    const names = config.names || {};
    const emojis = config.emojis || {};

    const options = Object.entries(prices).map(([key, price]) => ({
  label: `${names[key] || key} - ${price}$`,
  value: key,
  emoji: emojis[key] || undefined
}));


    if (options.length === 0) {
      return message.reply({ content: '⚠️ لا يوجد أي أغراض مضافة في الكونفج.' });
    }

    const embed = new EmbedBuilder()
      .setColor("#f1c40f")
      .setAuthor({ name: 'BR8 Ikea Store' })
      .setImage('https://i.imgur.com/GI1SDNp.png')
      .setDescription('**From here you can buy items such as mobile phones and other things from IKEA, and all the menus are located below the list**');

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('buy_menu')
        .setMaxValues(1)
        .setPlaceholder('Make Selection !')
        .addOptions(options)
    );

    await message.delete().catch(() => {});

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
