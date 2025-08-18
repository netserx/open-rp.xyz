const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField, Colors } = require('discord.js');

const dealerPath = path.join(__dirname, '../../dealer.json');

function loadDealer() {
  return JSON.parse(fs.readFileSync(dealerPath, 'utf-8'));
}

function saveDealer(cfg) {
  fs.writeFileSync(dealerPath, JSON.stringify(cfg, null, 2), 'utf-8');
}

module.exports = {
  name: 'add-dealer',
  description: 'يضيف أو يعدل غرض في dealer.json',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ما عندكش صلاحية تستخدم الأمر ده.');
    }

    const [key, displayName, priceStr, emoji] = args;
    if (!key || !displayName || !priceStr) {
      return message.reply('الاستخدام: `-add-dealer <key> <display_name> <price> [emoji]`');
    }

    const price = Number(priceStr);
    if (isNaN(price) || price < 0) {
      return message.reply('⚠️ السعر لازم يكون رقم صالح أكبر أو يساوي 0.');
    }

    const dealer = loadDealer();

    // لو الأقسام مش موجودة نعملها
    if (!dealer.prices) dealer.prices = {};
    if (!dealer.names) dealer.names = {};
    if (!dealer.emojis) dealer.emojis = {};

    const existed = Object.prototype.hasOwnProperty.call(dealer.prices, key);

    dealer.prices[key] = price;
    dealer.names[key] = displayName;
    if (emoji) dealer.emojis[key] = emoji;

    saveDealer(dealer);

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
