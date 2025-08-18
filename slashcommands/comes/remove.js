const guildBase = require('../../Models/guildBase')
module.exports = {
  name: `ازالة`,
  description: "للحذف",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "استدعاء",
      description: "لإزالة استدعاءات قديمة",
      type: 1,
      options: [
        {
          name: "الاسم",
          type: 3,
          description: "ارفق نوع الاستدعاء الذي تريد حذفه",
          required: true
        }
      ]
    },
    {
      name: "عقوبة",
      description: "لإزالة عقوبات قديمة",
      type: 1,
      options: [
        {
          name: "الاسم",
          type: 3,
          description: "ارفق نوع العقوبة الذي تريد حذفه",
          required: true
        }
      ]
    }
  ],
  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "ازالة") {
      let db = await guildBase.findOne({ guild: interaction.guild.id })
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id })
        await db.save()
      }

      if (interaction.options._subcommand == "استدعاء") {
        let name = interaction.options.getString("الاسم")

        let index = db.comes.all.findIndex(c => c.toLowerCase() === name.toLowerCase())
        if (index === -1) return interaction.relply({
          content: `:x: | لا استطيع ايجاد استدعاءات بهذا الاسم`,
          ephemeral: true
        })

        db.comes.all.splice(index, 1)
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم حذف هذا الاستدعاء بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "عقوبة") {
        let name = interaction.options.getString("الاسم")

        let index = db.reasons.findIndex(reason => reason.name.toLowerCase() === name.toLowerCase())
        if (index === -1) return interaction.relply({
          content: `:x: | لا استطيع ايجاد عقوبة بهذا الاسم`,
          ephemeral: true
        })

        db.reasons.splice(index, 1)
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم حذف هذه العقوبة بنجاح`, ephemeral: true })
      }
    }
  }
};
