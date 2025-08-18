const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField, Colors } = require('discord.js');

const carsPath = path.join(__dirname, '../../cars.json');

function loadCars() {
  return JSON.parse(fs.readFileSync(carsPath, 'utf-8'));
}

function saveCars(cfg) {
  fs.writeFileSync(carsPath, JSON.stringify(cfg, null, 2), 'utf-8');
}

module.exports = {
  name: 'add-car',
  description: 'يضيف أو يعدل عربية في cars.json',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ما عندكش صلاحية تستخدم الأمر ده.');
    }

    // args: name | price | rode | image
    const [name, priceStr, rodeStr, image] = args;
    if (!name || !priceStr || !rodeStr || !image) {
      return message.reply(
        'الاستخدام: `-add-car <name> <price> <rode:true/false> <image_url>`'
      );
    }

    const price = Number(priceStr);
    if (isNaN(price) || price < 0) {
      return message.reply('⚠️ السعر لازم يكون رقم صالح أكبر أو يساوي 0.');
    }

    const rode = rodeStr.toLowerCase() === 'true';

    const carsData = loadCars();
    if (!carsData.cars) carsData.cars = [];

    // لو الاسم موجود نعدله
    const existingIndex = carsData.cars.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    const carObj = { name, price, rode, image };

    let existed = false;
    if (existingIndex !== -1) {
      carsData.cars[existingIndex] = carObj;
      existed = true;
    } else {
      carsData.cars.push(carObj);
    }

    saveCars(carsData);

    const embed = new EmbedBuilder()
      .setTitle(existed ? 'تم تعديل العربية' : 'تم إضافة العربية')
      .setColor(Colors.Green)
      .setThumbnail(image)
      .addFields(
        { name: 'الاسم', value: name, inline: false },
        { name: 'السعر', value: `${price}$`, inline: true },
        { name: 'rode', value: rode ? '✅ موجودة على الطريق' : '❌ مش على الطريق', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }
};
