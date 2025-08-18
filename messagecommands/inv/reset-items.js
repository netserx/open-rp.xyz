const userBase = require('../../Models/userBase')
  , guildBase = require('../../Models/guildBase')
  , { invLog } = require("../../config.json");

module.exports = {
  name: `reset-item`,
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
      content: `:x: | يجب عليك منشن الشخص الذي تريد تصفير اغراضه`
    })

    let character = args[1], only = ["1", "2"]
    if (!character || !only.includes(character)) return message.reply({
      content: `:x: | يجب عليك تحديد الشخصية الذي تريد تصفير اغراضها 1 / 2`
    })

    if (user.bot) return message.reply({
      content: `:x: | لا يمكنك تصفير اغراض بوتات`
    })
    
    await userBase.updateOne({ guild: message.guild.id, user: user.id },
      {
        $set: {
          [`${character === "1" ? "c1" : "c2"}.inv`]: []
        }
      }
    );

    await message.reply({
      content: `:white_check_mark: | تم تصفير الاغراض بنجاح`
    })

    let log = message.guild.channels.cache.get(invLog)
    if (!log) return;

    log.send({
      embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  تم تصفير منتجات من قبل | ${message.author}

 - العضو | ${user}

   . **`)]
  })
  }
};
