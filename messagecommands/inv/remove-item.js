const userBase = require('../../Models/userBase')
  , guildBase = require('../../Models/guildBase')
  , { invLog } = require("../../config.json");

module.exports = {
  name: `remove-item`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id })
    if (!db) {
      db = new guildBase({ guild: message.guild.id })
      await db.save()
    }

    if (!db.inv_admin) return message.reply({
      content: `:x: | تعذر الاستخدام بسبب عدم تعيين مسؤولين الحقيبة`
    })

    if (!message.guild.roles.cache.get(db.inv_admin)) return message.reply({
      content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`
    })

    if (!message.member.roles.cache.has(db.inv_admin)) return message.reply({
      content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك غير مسؤول عن الحقيبة`
    })

    let user = message.mentions.users.first();
    if (!user) return message.reply({
      content: `:x: | يجب عليك منشن الشخص الذي تريد ازالة اغراض منها`
    })

    let character = args[1], only = ["1", "2"]
    if (!character || !only.includes(character)) return message.reply({
      content: `:x: | يجب عليك تحديد الشخصية الذي تريد ازالة اغراض منها 1 / 2`
    })

    let amount = args[2]
    if (!amount || isNaN(amount)) return message.reply({
      content: `:x: | يجب عليك تحديد كمية الغرض التي تريد ازالتها من الشخص`
    })

    let type = message.content.split(" ").splice(4).join(" ")
    if (!type) return message.reply({
      content: `:x: | يجب عليك تحديد الغرض الذي تريد ازالته`
    })

    if (user.bot) return message.reply({
      content: `:x: | لا يمكنك ازالة اغراض من بوتات`
    })

    let data = await userBase.findOne({ guild: message.guild.id, user: user.id })
    if (!data) {
      data = new userBase({ guild: message.guild.id, user: user.id })
      await data.save()
    }

    character === "1" ? data = data.c1 : data = data.c2

    let index = data.inv.findIndex(c => c.name.toLowerCase() == type.toLowerCase())
    if (index == -1) return message.reply({
        content: `:x: | لا أستطيع ايجاد غرض بهذا الاسم`
    })

    if(data.inv[index].count <= Number(amount)) {
        data.inv.splice(index, 1)
    } else {
        data.inv[index] = { name: data.inv[index].name, count: parseInt(Number(data.inv[index].count) - Number(amount)) }
    }

    await userBase.updateOne({ guild: message.guild.id, user: user.id },
      {
        $set: {
          [`${character === "1" ? "c1" : "c2"}.inv`]: data.inv
        }
      }
    );

    await message.reply({
      content: ` | تم إزالة الاغراض بنجاح`
    })

    let log = message.guild.channels.cache.get(invLog)
    if (!log) return;
    log.send({
        embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** تم إزالة منتج من قبل | ${message.author}

 - العضو | ${user}

 - المنتج | ${type}

  .**`)]
    })
  }
};
