const userBase = require('../../Models/userBase')
  , guildBase = require('../../Models/guildBase')

module.exports = {
  name: `تصفير-اموال`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id })
    if (!db) {
      db = new guildBase({ guild: message.guild.id })
      await db.save()
    }

    if (!db.bank) return message.reply({ content: `:x: | يجب عليك تعيين رتبة المسؤولين عن البنك قبل استخدام الامر` })

    let role2 = message.guild.roles.cache.get(db.bank)
    if (!role2) return message.reply({ content: `:x: | تم مسح رتبة المسؤولين عن البنك من السيرفر يجب عليك إعادة تعيينها` })

    if (!message.member.roles.cache.has(role2.id)) return message.reply({ content: `:x: | لا يمكنك استخدام هذا الامر لانك غير مسؤول عن البنك` })

    let user = message.mentions.members.first()
    if (!user) return message.reply({
      content: `:x: | يجب عليك تحديد الشخص الذي تريد خصم اموال منه`
    })

    if (user.user.bot) return message.reply({
      content: `:x: | لا يمكنك تصفير اموال من بوتات`
    })

    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`resetm_${message.author.id}_1`)
        .setLabel("الشخصية الاولى")
        .setStyle("Success"),

      new Discord.ButtonBuilder()
        .setCustomId(`resetm_${message.author.id}_2`)
        .setLabel("الشخصية الثانية")
        .setStyle("Success")
    )

    let msg = await message.reply({
      content: `:hourglass: | يجب ان تختار الشخصية التي تريد تصفير اموالها`,
      components: [row]
    })

    const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 20000 });
    collector.on('collect', async i => {
      if (i.user.id != message.author.id) return i.reply({
        content: `**⚠️ - ليس لديك صلاحيات لاستخدام الازرار**`,
        ephemeral: true
      })

      if (i.customId.startsWith("resetm_")) {
        let data = await userBase.findOne({ guild: message.guild.id, user: user.user.id })
        if (!data) {
          data = new userBase({ guild: message.guild.id, user: user.user.id })
          await data.save()
        }

        i.customId.endsWith("1") ? data = data.c1 : data = data.c2

        await userBase.updateOne({ guild: message.guild.id, user: user.user.id },
          {
            $set: {
              [`${i.customId.endsWith("1") ? "c1" : "c2"}.bank`]: 0
            }
          }
        );

        await msg.edit({
          content: `:white_check_mark: | تم تصفير الاموال بنجاح من المواطن ${user.user} داخل الشخصية ${i.customId.endsWith("1") ? "الاولى" : "الثانية"}`,
          components: []
        })

      } else return;
    })

  }
};
