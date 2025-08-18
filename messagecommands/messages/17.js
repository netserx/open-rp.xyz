const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const policePath = path.join(__dirname, '../../police.json');

// تحميل بيانات police.json
function loadPolice() {
  try {
    return JSON.parse(fs.readFileSync(policePath, 'utf-8'));
  } catch (err) {
    console.error('Error loading police.json:', err);
    return {};
  }
}

module.exports = {
  name: 'send-message17',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({ content: '❌ ما عندكش صلاحية تستخدم الأمر ده.' });
    }

    // تحميل البيانات
    const policeData = loadPolice();
    const prices = policeData.prices || {};
    const names = policeData.names || {};
    const emojis = policeData.emojis || {};

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
      return message.reply({ content: '⚠️ لا يوجد أي أغراض مضافة في police.json.' });
    }

    const embed = new EmbedBuilder()
      .setColor("#0044ff")
      .setAuthor({ name: "Police Store" })
      .setImage("https://i.postimg.cc/N0dDKfrN/IMG-6793.png") // غير اللينك لو عندك صورة مخصصة
      .setDescription(`**From here you can purchase all military equipment permitted for your rank only. It is prohibited to purchase any other military equipment such as heavy weapons and others, which is not permitted for your rank**`);

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
