


const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const dealerPath = path.join(__dirname, '../../dealer.json');

// تحميل بيانات dealer.json
function loadDealer() {
  try {
    return JSON.parse(fs.readFileSync(dealerPath, 'utf-8'));
  } catch (err) {
    console.error('Error loading dealer.json:', err);
    return {};
  }
}

// حفظ بيانات dealer.json
function saveDealer(data) {
  try {
    fs.writeFileSync(dealerPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving dealer.json:', err);
  }
}

module.exports = {
  name: 'send-message5',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({ content: '❌ ما عندكش صلاحية تستخدم الأمر ده.' });
    }

    // تحميل البيانات
    const dealerData = loadDealer();
    const prices = dealerData.prices || {};
    const names = dealerData.names || {};
    const emojis = dealerData.emojis || {};

    // تجهيز قائمة الاختيارات
    const options = Object.entries(prices).map(([key, price]) => {
      let label = `${names[key] || key} - ${price}$`.trim();
      if (label.length < 2) label = "Unnamed Item";
      label = label.slice(0, 25);

      let value = key.trim();
      if (value.length < 2) value = `id_${Math.random().toString(36).slice(2, 6)}`;
      value = value.slice(0, 100);

      return {
        label,
        value,
        emoji: emojis[key] || undefined
      };
    });

    if (options.length === 0) {
      return message.reply({ content: '⚠️ لا يوجد أي أغراض مضافة في dealer.json.' });
    }

    const embed = new EmbedBuilder()
      .setColor("#ca1111")
      .setAuthor({ name: "dealer Store" })
      .setImage("https://i.postimg.cc/TPfmfqyg/IMG-8311.png")
      .setDescription(`**From here you can buy the rest of the robbery requirements, prepared cards, and you can also buy weapons if you do not want to collect or manufacture, but you must have the full amount for the weapon, but before that you must go to the dealer in GTA**`);

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

