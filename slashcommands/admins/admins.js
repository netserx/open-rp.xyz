const guildBase = require('../../Models/guildBase')
module.exports = {
  name: `مسؤول`,
  description: "لتعين المسؤولين",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "الاقيام",
      description: "لتعين مسؤول الاقيام",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول الاقيام",
          required: true
        }
      ]
    },
    {
      name: "العساكر",
      description: "لتعين مسؤولين عن العساكر",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول للعساكر",
          required: true
        }
      ]
    },
    {
      name: "الباند",
      description: "لتعين مسؤول الباند",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول الباند",
          required: true
        }
      ]
    },
    {
      name: "الساحرة",
      description: "لتعين رتبة مسؤولي إنعاش الساحرة",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها لمسؤولي إنعاش الساحرة",
          required: true
        }
      ]   
    },
    {
      name: "الرقابة",
      description: "لتعين رتبة مسؤولين الرقابة",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرتبة الذي تريد تعينها لمسؤولين الرقابة",
          required: true
        }
      ]   
    },
    {
      name: "الحقيبة",
      description: "لتعين مسؤول الحقيبة",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول الحقيبة",
          required: true
        }
      ]
    },
    {
      name: "النقاط",
      description: "لتعين مسؤول النقاط",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول النقاط",
          required: true
        }
      ]   
    },
    {
      name: "الهويات",
      description: "لتعين مسؤول الهويات",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول الهوية",
          required: true
        }
      ]   
    },
    {
      name: "البنك",
      description: "لتعين مسؤول البنك",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول البنك",
          required: true
        }
      ]   
    },
    {
      name: "الاستدعاء",
      description: "لتعين مسؤول الاستدعاءات",
      type: 1,
      options: [
        {
          name: "الرتبة",
          type: 8,
          description: "ارفق الرول الذي تريد تعينها مسؤول الاستدعاءات",
          required: true
        }
      ]   
    },
  ],
  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "مسؤول") {
      let db = await guildBase.findOne({ guild: interaction.guild.id })
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id })
        await db.save()
      }

      if (interaction.options._subcommand == "الاقيام") {
        let role = interaction.options.getRole("الرتبة")

        db.games_admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤولين الاقيام بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "العساكر") {
        let role = interaction.options.getRole("الرتبة")

        db.police_high = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤولين العساكر بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الباند") {
        let role = interaction.options.getRole("الرتبة")

        db.blacklist = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤولين الباند بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الرقابة") {
        let role = interaction.options.getRole("الرتبة")

        db.gmc_admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤولين الرقابة بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الساحرة") {
        let role = interaction.options.getRole("الرتبة")

        db.magic_admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤولي إنعاش الساحرة بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "النقاط") {
        let role = interaction.options.getRole("الرتبة")

        db.points_admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤولين النقاط بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الهويات") {
        let role = interaction.options.getRole("الرتبة")

        db.idd.admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤولين الهويات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الاستدعاء") {
        let role = interaction.options.getRole("الرتبة")

        db.comes.admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤول الاستدعاءات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "البنك") {
        let role = interaction.options.getRole("الرتبة")

        db.bank_admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤول البنك بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الحقيبة") {
        let role = interaction.options.getRole("الرتبة")

        db.inv_admin = role.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين رتبة مسؤول الحقيبة بنجاح`, ephemeral: true })
      }
    }
  }
};
