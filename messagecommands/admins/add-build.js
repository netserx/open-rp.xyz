const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField, Colors } = require('discord.js');

const buildsPath = path.join(__dirname, '../../builds.json');

function loadBuilds() {
  return JSON.parse(fs.readFileSync(buildsPath, 'utf-8'));
}

function saveBuilds(cfg) {
  fs.writeFileSync(buildsPath, JSON.stringify(cfg, null, 2), 'utf-8');
}

module.exports = {
  name: 'add-build',
  description: 'يضيف أو يعدل مبنى في builds.json',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ما عندكش صلاحية تستخدم الأمر ده.');
    }

    // args: name | price | location | image | garage | storage
    const [name, priceStr, location, image, garageStr, storageStr] = args;
    if (!name || !priceStr || !location || !image || !garageStr || !storageStr) {
      return message.reply(
        'الاستخدام: `-add-build <name> <price> <location> <image_url> <garage> <storage>`'
      );
    }

    const price = Number(priceStr);
    const garage = Number(garageStr);
    const storage = Number(storageStr);

    if ([price, garage, storage].some(n => isNaN(n) || n < 0)) {
      return message.reply('⚠️ السعر والجراج والتخزين لازم يكونوا أرقام صالحة (>= 0).');
    }

    const buildsData = loadBuilds();
    if (!buildsData.builds) buildsData.builds = [];

    // نشوف هل الاسم موجود قبل كده
    const existingIndex = buildsData.builds.findIndex(b => b.name === name);
    const buildObj = { name, price, location, image, garage, storage };

    let existed = false;
    if (existingIndex !== -1) {
      buildsData.builds[existingIndex] = buildObj;
      existed = true;
    } else {
      buildsData.builds.push(buildObj);
    }

    saveBuilds(buildsData);

    const embed = new EmbedBuilder()
      .setTitle(existed ? 'تم تعديل المبنى' : 'تم إضافة المبنى')
      .setColor(Colors.Green)
      .setThumbnail(image)
      .addFields(
        { name: 'الاسم', value: name, inline: false },
        { name: 'السعر', value: `${price}$`, inline: true },
        { name: 'الموقع', value: location, inline: true },
        { name: 'الجراج', value: `${garage}`, inline: true },
        { name: 'التخزين', value: `${storage}`, inline: true }
      );

    await message.reply({ embeds: [embed] });
  }
};
