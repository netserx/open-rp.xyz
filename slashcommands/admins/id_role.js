const guildBase = require('../../Models/guildBase')
module.exports = {
  name: `رتبة`,
  description: "لتعين الرتب",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "الهويات",
      description: "لتعين رتبة الهويات",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها للهويات",
          required: true
        }
      ]   
    },
    {
      name: "الإدارة",
      description: "لتعين رتبة الإدارة",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها للإدارة",
          required: true
        }
      ]   
    },
    {
      name: "التطوير",
      description: "لتعين رتب التطوير",
      type: 1,
      options: [
        {
          name: "لفل_1",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها للفل 1",
          required: true
        },
        {
          name: "لفل_2",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها للفل 2",
          required: true
        },
        {
          name: "لفل_3",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها للفل 3",
          required: true
        },
        {
          name: "لفل_4",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها للفل 4",
          required: true
        },
        {
          name: "لفل_5",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها للفل 5",
          required: true
        }
      ]   
    },
  ],
  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "رتبة") {
      let db = await guildBase.findOne({ guild: interaction.guild.id })
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id })
        await db.save()
      }
      
      if (interaction.options._subcommand == "الهويات") {
        let role = interaction.options.getRole("الرتبة")

        db.idd.role = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة الهويات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الإدارة") {
        let role = interaction.options.getRole("الرتبة")

        db.staff_role = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة الإدارة بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "التطوير") {
        let lvl_1 = interaction.options.getRole("لفل_1")
        , lvl_2 = interaction.options.getRole("لفل_2")
        , lvl_3 = interaction.options.getRole("لفل_3")
        , lvl_4 = interaction.options.getRole("لفل_4")
        , lvl_5 = interaction.options.getRole("لفل_5")

        db.levels = { 
          "1": lvl_1.id,
          "2": lvl_2.id,
          "3": lvl_3.id,
          "4": lvl_4.id,
          "5": lvl_5.id
        }
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتب التطوير بنجاح`, ephemeral: true })
      }
    }
  }
};
