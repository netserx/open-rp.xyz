const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField, Colors } = require('discord.js');

const policePath = path.join(__dirname, '../../police.json');

// تحميل بيانات police.json
function loadPolice() {
  try {
    return JSON.parse(fs.readFileSync(policePath, 'utf-8'));
  } catch (err) {
    console.error('Error loading police.json:', err);
    return { prices: {}, names: {}, emojis: {} };
  }
}

// حفظ بيانات police.json
function savePolice(data) {
  try {
    fs.writeFileSync(policePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving police.json:', err);
  }
}

module.exports = {
  name: 'add-police',
  description: 'يضيف أو يعدل غرض في police.json',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ما عندكش صلاحية تستخدم الأمر ده.');
    }

    const [key, displayName, priceStr, emoji] = args;
    if (!key || !displayName || !priceStr) {
      return message.reply('الاستخدام: `-add-police <key> <display_name> <price> [emoji]`');
    }

    const price = Number(priceStr);
    if (isNaN(price) || price < 0) {
      return message.reply('⚠️ السعر لازم يكون رقم صالح أكبر أو يساوي 0.');
    }

    const policeData = loadPolice();
    if (!policeData.prices) policeData.prices = {};
    if (!policeData.names) policeData.names = {};
    if (!policeData.emojis) policeData.emojis = {};

    const existed = Object.prototype.hasOwnProperty.call(policeData.prices, key);

    policeData.prices[key] = price;
    policeData.names[key] = displayName;
    if (emoji) policeData.emojis[key] = emoji;

    savePolice(policeData);

    const embed = new EmbedBuilder()
      .setTitle(existed ? 'تم تعديل الغرض في متجر الشرطة' : 'تم إضافة الغرض إلى متجر الشرطة')
      .setColor(Colors.Blue)
      .addFields(
        { name: 'المفتاح', value: key, inline: true },
        { name: 'الاسم الظاهر', value: displayName, inline: true },
        { name: 'السعر', value: `${price}$`, inline: true },
        ...(emoji ? [{ name: 'الإيموجي', value: emoji, inline: true }] : [])
      );

    await message.reply({ embeds: [embed] });
  }
};
