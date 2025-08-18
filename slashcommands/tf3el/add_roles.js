const guildBase = require('../../Models/guildBase')
module.exports = {
  name: `تعيين`,
  description: "للتعينات",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "رتب",
      description: "لتعين الرتب",
      type: 2,
      options: [
        {
          name: "التفعيل",
          type: 1,
          description: "لتعين رتب التفعيل",
          options: [
            {
                name: "النوع",
                type: 3,
                description: "اختر نوع الرتب اضافة او ازالة",
                required: true,
                choices: [
                    { name: "اضافة", value: "add" },
                    { name: "ازالة", value: "remove" }
                ]
            },
            {
                name: "الرتبة",
                type: 8,
                description: "ارفق الرول الذي تريدها",
                required: true
            }
          ]
        }
      ]
    },
    {
      name: "رتبة",
      description: "لتعين الرتب",
      type: 2,
      options: [
        {
          name: "العساكر",
          type: 1,
          description: "لتعين رتبة العساكر",
          options: [
            {
                name: "الرتبة",
                type: 8,
                description: "ارفق الرول الذي تريد تعينها للعساكر",
                required: true
            }
          ]
        }
      ]
    }
  ],
  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "تعيين") {
      let db = await guildBase.findOne({ guild: interaction.guild.id })
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id })
        await db.save()
      }

      if (interaction.options._group == "رتب") {
        if (interaction.options._subcommand == "التفعيل") {
            let choice = interaction.options.getString("النوع")
            let role = interaction.options.getRole("الرتبة")

            choice === "add" ? db.tf3el.add.push(role.id) : db.tf3el.remove.push(role.id)
            await db.save()
    
            await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة التفعيل بنجاح`, ephemeral: true })
        }
      } else if(interaction.options._group == "رتبة") {
        if (interaction.options._subcommand == "العساكر") {
            let role = interaction.options.getRole("الرتبة")

            db.police_admin = role.id
            await db.save()
    
            await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة العساكر بنجاح`, ephemeral: true })
        }
      }
    }
  }
};
