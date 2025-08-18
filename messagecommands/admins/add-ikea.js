const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField, Colors } = require('discord.js');

const configPath = path.join(__dirname, '../../config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}
function saveConfig(cfg) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
}

module.exports = {
  name: 'add-ikea',
  description: 'يضيف أو يعدل غرض في config.json ايكيا',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ما عندكش صلاحية تستخدم الأمر ده.');
    }

    const [key, displayName, priceStr, emoji] = args;
    if (!key || !displayName || !priceStr) {
      return message.reply('الاستخدام: `-add-item <key> <display_name> <price> [emoji]`');
    }

    const price = Number(priceStr);
    if (isNaN(price) || price < 0) {
      return message.reply('⚠️ السعر لازم يكون رقم صالح أكبر أو يساوي 0.');
    }

    const config = loadConfig();
    if (!config.prices) config.prices = {};
    if (!config.names) config.names = {};
    if (!config.emojis) config.emojis = {};

    const existed = Object.prototype.hasOwnProperty.call(config.prices, key);

    config.prices[key] = price;
    config.names[key] = displayName;
    if (emoji) config.emojis[key] = emoji;

    saveConfig(config);

    const embed = new EmbedBuilder()
      .setTitle(existed ? 'تم تعديل الغرض' : 'تم إضافة الغرض')
      .setColor(Colors.Green)
      .addFields(
        { name: 'المفتاح', value: key, inline: true },
        { name: 'الاسم الظاهر', value: displayName, inline: true },
        { name: 'السعر', value: `${price}$`, inline: true },
        ...(emoji ? [{ name: 'الإيموجي', value: emoji, inline: true }] : [])
      );

    await message.reply({ embeds: [embed] });
  }
};
