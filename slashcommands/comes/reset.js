const guildBase = require('../../Models/guildBase')
module.exports = {
  name: `اعادة`,
  description: "لإعادة التعيين",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "الاستدعاءات",
      description: "لإعادة تعيين جميع الاستدعاءات",
      type: 1
    },
    {
      name: "العقوبات",
      description: "لإعادة تعيين جميع العقوبات",
      type: 1
    },
    {
      name: "تعيين",
      description: "لإعادة التعيين",
      type: 2,
      options: [
        {
          name: "التفعيل",
          type: 1,
          description: "لإعادة تعيين رتب التفعيل"
        }
      ]
    }
  ],
  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "اعادة") {
      let db = await guildBase.findOne({ guild: interaction.guild.id })
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id })
        await db.save()
      }

      if (interaction.options._subcommand == "الاستدعاءات") {
        db.comes.all = []
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم حذف جميع الاستدعاءات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "العقوبات") {
        db.reasons = []
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم حذف جميع العقوبات بنجاح`, ephemeral: true })
      } else if (interaction.options._group == "تعيين") {
        if (interaction.options._subcommand == "التفعيل") {
          db.tf3el = { add: [], remove: [] }
          await db.save()

          await interaction.reply({ content: `:white_check_mark: | تم إعادة تعين جميع رتب التفعيل بنجاح`, ephemeral: true })
        }
      }
    }
  }
};
