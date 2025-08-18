const userBase = require('../../Models/userBase')
  , guildBase = require('../../Models/guildBase')
  , { invLog } = require('../../config.json')

module.exports = {
  name: `sell`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id })
    if (!db) {
      db = new guildBase({ guild: message.guild.id })
      await db.save();
    }

    let check = db.joins.find(c => c.user === message.author.id)
    if (!check) return message.reply({
      content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام هذا الامر`
    })

    let data = await userBase.findOne({ guild: message.guild.id, user: message.author.id })
    if (!data) {
      data = new userBase({ guild: message.guild.id, user: message.author.id })
      await data.save();
    }

    data = data[check.character]

    if (data.clamped) return message.reply({
      content: `** - انت مكلبش لايمكنك استخدام هذا الامر**`
    })

    let user = message.mentions.users.first()
    if (!user) return message.reply({
      content: `:x: | يجب عليك تحديد الشخص الذي تريد تحويل غرض له`
    })

    if(user.id === message.author.id || user.bot) return message.reply({
      content: `:x: | لا يمكنك تحويل الغرض ${user.bot ? `إلي ${user}` : "لنفسك"}`
    })

    let amount = args[1]
    if (!amount || isNaN(amount)) return message.reply({
      content: `:x: | يجب عليك تحديد كمية الغرض التي تريد تحويلها`
    })

    let type = message.content.split(" ").splice(3).join(" ")
    if (!type) return message.reply({
      content: `:x: | يجب عليك تحديد الغرض الذي تريد تحويله`
    })

    let check2 = db.joins.find(c => c.user === user.id)
    if (!check2) return message.reply({
      content: `:x: | يجب على ${user} تسجيل دخوله اولا حتى تتمكن من التحويل له`
    })

    let data2 = await userBase.findOne({ guild: message.guild.id, user: user.id })
    if (!data2) {
      data2 = new userBase({ guild: message.guild.id, user: user.id })
      await data2.save();
    }

    data2 = data2[check2.character]

    if (data2.clamped) return message.reply({
      content: `** - لا يمكنك التحويل لهذا الشخص لانه مكلبش**`
    })

    let index = data.inv.findIndex(c => c.name.toLowerCase() === type.toLowerCase())
    if (index == -1) return message.reply({
      content: `:x: | لا يوجد غرض بهذا الاسم لتحويله`
    })

    if (data.inv[index].count < Number(amount)) return message.reply({
      content: `:x: | كمية الغرض الذي تملكه أقل من الكمية الذي تريد تحويلها`
    })

    data.inv[index].count === Number(amount) ? data.inv.splice(index, 1) : data.inv[index].count = parseInt(data.inv[index].count - Number(amount))
    await userBase.updateOne({ guild: message.guild.id, user: message.author.id },
      {
        $set: {
          [`${check.character}.inv`]: data.inv
        }
      }
    );

    let index2 = data2.inv.findIndex(c => c.name.toLowerCase() === type.toLowerCase())
    index2 == -1 ? data2.inv.push({ name: type.toLowerCase(), count: Number(amount) }) : data2.inv[index2].count = parseInt(data2.inv[index2].count + Number(amount))

    await userBase.updateOne({ guild: message.guild.id, user: user.id },
      {
        $set: {
          [`${check2.character}.inv`]: data2.inv
        }
      }
    );

    message.reply({
      content: ` | تم تحويل الغرض بنجاح`
    })

    let log = message.guild.channels.cache.get(invLog)
    if (!log) return;

    log.send({
      embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  الشخصية | ${check.character === "c1" ? "1" : "2"}

 - العضو | ${message.author}

 - تم تحويل | ${type}

 - العضو المستلم | ${user}

 شخصية المستلم | ${check2.character === "c1" ? "1" : "2"}

  .**`)]
    })
  }
};
