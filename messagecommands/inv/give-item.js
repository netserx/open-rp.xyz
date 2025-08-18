const userBase = require('../../Models/userBase');
const guildBase = require('../../Models/guildBase');
const { invLog } = require("../../config.json");
const fs = require("fs");
const path = require("path");

const weapons = Object.values(require("../../weapons.json"))
  .flat()
  .map(p => String(p.name).toLowerCase());

// تحميل بيانات المتاجر
function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return { prices: {}, names: {}, emojis: {} };
  }
}

// دالة لتطبيع مفاتيح names إلى lowercase
const normalizeNames = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [String(k).toLowerCase(), v]));

// دالة لتوحيد النصوص للمطابقة (إزالة المسافات وتحويل لحروف صغيرة)
const normalize = str => String(str).toLowerCase().replace(/\s+/g, '');

const configData = loadJSON(path.join(__dirname, "../../config.json"));
const dealerData = loadJSON(path.join(__dirname, "../../dealer.json"));
const policeData = loadJSON(path.join(__dirname, "../../police.json"));

// دمج الأسماء (بعد التطبيع)
const allNamesMap = {
  ...normalizeNames(configData.names),
  ...normalizeNames(dealerData.names),
  ...normalizeNames(policeData.names),
};

// whitelist بالمفاتيح + الأسماء الظاهرة
const whitelist = new Set([
  "aluminium", "iron", "gunpowder", "plastic",
  "teser", "heavy armor", "radio", "knife", "diving kit", "parachute", "diverter", "light", "arcade",
  ...weapons,
  ...Object.keys(allNamesMap),     // المفاتيح
  ...Object.values(allNamesMap)    // الأسماء الظاهرة
].map(i => String(i).toLowerCase()));

module.exports = {
  name: `give-item`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id });
    if (!db) {
      db = new guildBase({ guild: message.guild.id });
      await db.save();
    }

    if (!db.inv_admin) return message.reply({ content: `:x: | تعذر الاستخدام بسبب عدم تعيين مسؤولين الحقيبة` });
    if (!message.guild.roles.cache.get(db.inv_admin)) return message.reply({ content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر` });
    if (!message.member.roles.cache.has(db.inv_admin)) return message.reply({ content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك غير مسؤول عن الحقيبة` });

    const user = message.mentions.users.first();
    if (!user) return message.reply({ content: `:x: | يجب عليك منشن الشخص الذي تريد اضافة اغراض له` });

    const character = args[1], only = ["1", "2"];
    if (!character || !only.includes(character)) return message.reply({ content: `:x: | يجب عليك تحديد الشخصية الذي تريد اضافة اغراض لها 1 / 2` });

    const amount = args[2];
    if (!amount || isNaN(amount)) return message.reply({ content: `:x: | يجب عليك تحديد كمية الغرض التي تريد اضافته للشخص` });

    const rawType = message.content.split(" ").splice(4).join(" ");
    if (!rawType) return message.reply({ content: `:x: | يجب عليك تحديد الغرض الذي تريد اضافته` });

    const normInput = normalize(rawType);

    // التأكد من أن الاسم موجود في الـ whitelist
    if (![...whitelist].some(item => normalize(item) === normInput)) {
      return message.reply({ content: `:x: | لا يوجد غرض بهذا الاسم حتى تتم إضافته` });
    }

    // إيجاد المفتاح الصحيح (من الاسم الداخلي أو الظاهر)
    let matchedKey = Object.keys(allNamesMap).find(k =>
      normalize(k) === normInput || normalize(allNamesMap[k]) === normInput
    );

    if (!matchedKey) matchedKey = rawType;

    const displayName = allNamesMap[matchedKey.toLowerCase()] || rawType;

    if (user.bot) return message.reply({ content: `:x: | لا يمكنك اضافة اغراض الي بوتات` });

    let dataDoc = await userBase.findOne({ guild: message.guild.id, user: user.id });
    if (!dataDoc) {
      dataDoc = new userBase({ guild: message.guild.id, user: user.id });
      await dataDoc.save();
    }

    // تأمين وجود الحقول
    dataDoc.c1 = dataDoc.c1 || { inv: [] };
    dataDoc.c2 = dataDoc.c2 || { inv: [] };

    let data = character === "1" ? dataDoc.c1 : dataDoc.c2;

    const idx = data.inv.findIndex(c => String(c.name).toLowerCase() === String(displayName).toLowerCase());
    if (idx === -1) {
      data.inv.push({ name: displayName, count: parseInt(amount) });
    } else {
      data.inv[idx].count += parseInt(amount);
    }

    await userBase.updateOne(
      { guild: message.guild.id, user: user.id },
      { $set: { [`${character === "1" ? "c1" : "c2"}.inv`]: data.inv } }
    );

    await message.reply({ content: `✅ | تم إضافة المنتج (${displayName}) بنجاح` });

    const log = message.guild.channels.cache.get(invLog);
    if (log) {
      log.send({
        embeds: [new Discord.EmbedBuilder()
          .setColor("#003d66")
          .setDescription(`** تم اضافة منتج من قبل | ${message.author}\n\n - العضو | ${user}\n\n - المنتج | ${displayName}\n\n  .**`)
        ]
      });
    }
  }
};
