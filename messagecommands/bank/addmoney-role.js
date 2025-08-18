const userBase = require('../../Models/userBase')
  , guildBase = require('../../Models/guildBase')
  , { log, embed } = require("../../functions");

module.exports = {
  name: `add-money-role`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id })
    if (!db) {
      db = new guildBase({ guild: message.guild.id })
      await db.save()
    }

    if (!db.bank_admin) return message.reply({ content: `**:x: - لم يتم تعين رتبة المسؤولين عن الحقيبة والبنك حتى الان**` })

    let role2 = message.guild.roles.cache.get(db.bank_admin)
    if (!role2) return message.reply({ content: `**:x: - لا استطيع ايجاد هذه الرول \`${db.bank_admin}\` داخل هذا الخادم**` })

    if (!message.member.roles.cache.has(role2.id)) return message.reply({ content: `**:x: - هذا الامر مخصص لمسؤولين الحقيبة والبنك فقط**` })

    let role = message.mentions.roles.first()
    if (!role) return message.reply({
      content: `**:x: -يجب عليك تحديد الرتبة الذي تريد اضافة فلوس له**`
    })

    let character = args[1], only = ["1", "2"]
    if (!character || !only.includes(character)) return message.reply({
      content: `:x: | يجب عليك تحديد الشخصية الذي تريد اضافة اموال لها 1 / 2`
    })

    let amount = args[2]
    if (!amount || isNaN(amount)) return message.reply({
      content: `:x: | يجب عليك تحديد الكمية الذي تريد اضافتها`
    })
    amount = Number(amount)

    await message.guild.members.fetch();
    let members = role.members.filter(c => !c.user.bot).map(u => u.user.id)
    if (members.length <= 0) return message.reply({
      content: `**:x: - لا يوجد أعضاء يمتلكون هذه الرتبة**`
    })

    members.forEach(async member => {
      let data = await userBase.findOne({ guild: message.guild.id, user: member })
      if (!data) {
        data = new userBase({ guild: message.guild.id, user: member })
        await data.save()
      }

      character === "1" ? data = data.c1 : data = data.c2

      await userBase.updateOne({ guild: message.guild.id, user: member },
        {
          $set: {
            [`${character === "1" ? "c1" : "c2"}.bank`]: parseInt(data.bank + amount)
          }
        }
      );
    })

    await message.reply({
      content: `**:white_check_mark: - تم إضافة مبلغ مالي بنجاح

إلي اعضاء رتبة : ${role}

المبلغ المالي : ${amount}

داخل الشخصية : ${character === "1"}**`
    })

    let log = message.guild.channels.cache.get(db.bank_log)
    if(!log) return;

    log.send({
      embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** 
 - Add Money By | ${message.author} 

 - Role | ${role}

BR8 - Money | ${amount}

 -   .**`)]
    })
  }
};
