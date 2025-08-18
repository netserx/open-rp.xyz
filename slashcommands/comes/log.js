const guildBase = require('../../Models/guildBase')
module.exports = {
  name: `لوق`,
  description: "لتعين اللوقات",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "الاستدعاءات",
      description: "لتعين لوق الاستدعاءات",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق الاستدعاءات",
          required: true
        }
      ]
    },
    {
      name: "العقوبات",
      description: "لتعين لوق العقوبات",
      type: 1,
      options: [
        {
          name: "اللوق",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق العقوبات",
          required: true
        },
        {
          name: "الباند",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق الباند",
          required: true
        },
      ]
    },
    {
      name: "التفعيل",
      description: "لتعين لوق التفعيلات",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق التفعيلات",
          required: true
        }
      ]
    },
    {
      name: "البنك",
      description: "لتعين لوق البنك",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق البنك",
          required: true
        }
      ]
    },
    {
      name: "الهويات",
      description: "لتعين لوق الهويات",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق الهويات",
          required: true
        }
      ]
    },
    {
      name: "التصنيع",
      description: "لتعين لوق التصنيع",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق التصنيع",
          required: true
        }
      ]
    },
    {
      name: "العسكر",
      description: "لتعين لوق العسكر",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للوق العسكر",
          required: true
        }
      ]
    },
  ],
  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "لوق") {
      let db = await guildBase.findOne({ guild: interaction.guild.id })
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id })
        await db.save()
      }

      if (interaction.options._subcommand == "الاستدعاءات") {
        let channel = interaction.options.getChannel("الروم")

        db.comes.log = channel.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين لوق الاستدعاءات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "العقوبات") {
        let channel = interaction.options.getChannel("اللوق")
        let channel2 = interaction.options.getChannel("الباند")

        db.ban_chat_log = channel2.id
        db.ban_log = channel.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين لوق العقوبات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "التفعيل") {
        let channel = interaction.options.getChannel("الروم")

        db.tf3el.log = channel.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين لوق التفعيلات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "البنك") {
        let channel = interaction.options.getChannel("الروم")

        db.bank_log = channel.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين لوق البنك بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "الهويات") {
        let channel = interaction.options.getChannel("الروم")

        db.idd.log = channel.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين لوق الهويات بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "التصنيع") {
        let channel = interaction.options.getChannel("الروم")

        db.make_log = channel.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين لوق التصنيع بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "العسكر") {
        let channel = interaction.options.getChannel("الروم")

        db.police_log = channel.id
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم تعين لوق العسكر بنجاح`, ephemeral: true })
      }
    }
  }
};
