const userBase = require('../../Models/userBase')
  , guildBase = require('../../Models/guildBase')
  , { invLog } = require('../../config.json')

module.exports = {
  name: `use`,
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

    let amount = args[0]
    if (!amount || isNaN(amount)) return message.reply({
      content: `:x: | يجب عليك تحديد كمية الغرض التي تريد استخدامها`
    })

    let type = message.content.split(" ").splice(2).join(" ")
    if (!type) return message.reply({
      content: `:x: | يجب عليك تحديد الغرض الذي تريد استخدامه`
    })

    let index = data.inv.findIndex(c => c.name.toLowerCase() === type.toLowerCase())
    if (index == -1) return message.reply({
      content: `:x: | لا يوجد غرض بهذا الاسم لاستخدامه`
    })

    if (data.inv[index].count < Number(amount)) return message.reply({
      content: `:x: | كمية الغرض الذي تملكه أقل من الكمية الذي تريد استخدامها`
    })

    data.inv[index].count === Number(amount) ? data.inv.splice(index, 1) : data.inv[index].count = parseInt(data.inv[index].count - Number(amount))
    await userBase.updateOne({ guild: message.guild.id, user: message.author.id },
      {
        $set: {
          [`${check.character}.inv`]: data.inv
        }
      }
    );

    message.reply({
      content: `:white_check_mark: | تم إستخدام الغرض بنجاح`
    })

    let log = message.guild.channels.cache.get(invLog)
    if (!log) return;

    log.send({
      embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** الشخصية | ${check.character === "c1" ? "1" : "2"}

 - العضو | ${message.author}

 - استخدم | ${type}

  .**`)]
    })
  }
};
