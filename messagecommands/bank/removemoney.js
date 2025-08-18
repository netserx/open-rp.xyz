const Discord = require("discord.js")
const userBase = require("../../Models/userBase")
const guildBase = require("../../Models/guildBase")

module.exports = {
  name: `remove-money`,
  run: async (client, message, args) => {
    let data = await guildBase.findOne({ guild: message.guild.id })
    if (!data) {
      data = new guildBase({ guild: message.guild.id })
      await data.save();
    }

    if (!data.bank_admin) return message.reply({
      content: `:x: | تعذر الاستخدام بسبب عدم تعيين مسؤولين البنك`
    })

    if (!message.guild.roles.cache.get(data.bank_admin)) return message.reply({
      content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`
    })

    if (!message.member.roles.cache.has(data.bank_admin)) return message.reply({
      content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر لانك غير مسؤول عن البنك`
    })

    let user = message.mentions.users.first();
    if (!user) return message.reply({
      content: `:x: | يجب عليك منشن الشخص الذي تريد خصم فلوس منه`
    })

    let character = args[1], only = ["1", "2"]
    if (!character || !only.includes(character)) return message.reply({
      content: `:x: | يجب عليك تحديد الشخصية الذي تريد خصم اموال منها 1 / 2`
    })

    let money = args[2]
    if (!money || isNaN(money)) return message.reply({
      content: `:x: | يجب عليك تحديد الكمية الذي تريد خصمها `
    })
    money = Number(money)

    let db = await userBase.findOne({ guild: message.guild.id, user: user.id })
    if (!db) {
      db = new userBase({ guild: message.guild.id, user: user.id })
      await db.save();
    }

    character === "1" ? db = db.c1 : db = db.c2

    if(db.bank < money) return message.reply({
      content: `:x: | رصيد ${user} البنكي اقل من المبلغ الذي تريد خصمه`
    })

    await userBase.updateOne({ guild: message.guild.id, user: user.id },
      {
        $set: { [`${character === "1" ? "c1" : "c2"}.bank`]: parseInt(db.bank - money) }
      }
    );

    await message.reply({
      embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`:white_check_mark: | تم خصم ( ${money} ) من الشخصية ${character === "1" ? "الاولى" : "الثانية"} بنجاح`)]
    })

    let log = message.guild.channels.cache.get(data.bank_log)
    if(!log) return;

    log.send({
      embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Remove Money By | ${message.author}

 - Player | ${user}

 - Money | ${money}

 -   .**`)]
    })
  }
};
