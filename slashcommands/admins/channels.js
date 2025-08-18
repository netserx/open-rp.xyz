const guildBase = require('../../Models/guildBase');

module.exports = {
  name: `روم`,
  description: "لتعين الرومات",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "حالة",
      description: "لتعين روم حالة السيرفر",
      type: 2,
      options: [
        {
          name: "السيرفر",
          type: 1,
          description: "لتعين روم حالة السيرفر",
          options: [
            {
              name: "الروم",
              type: 7,
              channel_types: [0],
              description: "ارفق الروم الذي تريد تعينه لحالة السيرفر",
              required: true
            }
          ]
        }
      ]
    },
    {
      name: "الهويات",
      description: "لتعين روم الهويات",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه لتقديمات الهويات",
          required: true
        }
      ]
    },
    {
      name: "الهاتف",
      description: "لتعين رومات الهاتف",
      type: 1,
      options: [
        {
          name: "911",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للشرطة",
          required: true
        },
        {
          name: "gmc",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للحضور الرقابي",
          required: true
        }
      ]
    },
    {
      name: "كشف-الحقيبة",
      description: "لتعين روم كشف-الحقيبة",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه لكشف الحقيبة",
          required: true
        }
      ]
    },
    {
      name: "التشهير",
      description: "لتعين روم التشهير",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للتشهير",
          required: true
        }
      ]
    },
    {
      name: "الاستدعاءات",
      description: "لتعين روم الاستدعاءات",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للاستدعاءات",
          required: true
        }
      ]
    },
    {
      name: "البلاغات",
      description: "لتعين روم البلاغات",
      type: 1,
      options: [
        {
          name: "الروم",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه للبلاغات",
          required: true
        }
      ]
    },
    {
      name: "الاقيام",
      description: "لتعين رومات الاقيام",
      type: 1,
      options: [
        {
          name: "الرحلة",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه لبدأ الاقيام",
          required: true
        },
        {
          name: "التنبيهات",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه لتنبيهات الاقيام",
          required: true
        },
        {
          name: "التسجيلات",
          type: 7,
          channel_types: [0],
          description: "ارفق الروم الذي تريد تعينه لتسجيل الدخول",
          required: true
        }
      ]
    }
  ],

  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "روم") {
      let db = await guildBase.findOne({ guild: interaction.guild.id });
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id });
        await db.save();
      }

      if (interaction.options._subcommand == "الهويات") {
        let channel = interaction.options.getChannel("الروم");
        db.idd.channel = channel.id;
        await db.save();
        await interaction.reply({ content: `✅ | تم تعين روم تقديمات الهويات بنجاح`, ephemeral: true });

      } else if (interaction.options._subcommand == "الهاتف") {
        let channel = interaction.options.getChannel("911");
        let channel2 = interaction.options.getChannel("gmc");
        db.phone.nineoneone = channel.id;
        db.phone.gmc = channel2.id;
        await db.save();
        await interaction.reply({ content: `✅ | تم تعين رومات الهاتف بنجاح`, ephemeral: true });

      } else if (interaction.options._subcommand == "التشهير") {
        let channel = interaction.options.getChannel("الروم");
        db.tshher_channel = channel.id;
        await db.save();
        await interaction.reply({ content: `✅ | تم تعين روم التشهير بنجاح`, ephemeral: true });

      } else if (interaction.options._subcommand == "الاستدعاءات") {
        let channel = interaction.options.getChannel("الروم");
        db.comes.channel = channel.id;
        await db.save();
        await interaction.reply({ content: `✅ | تم تعين روم الاستدعاءات بنجاح`, ephemeral: true });

      } else if (interaction.options._subcommand == "كشف-الحقيبة") {
        let channel = interaction.options.getChannel("الروم");
        db.show_inv_channel = channel.id;
        await db.save();
        await interaction.reply({ content: `✅ | تم تعين روم كشف الحقيبة بنجاح`, ephemeral: true });

      } else if (interaction.options._subcommand == "البلاغات") {
        let channel = interaction.options.getChannel("الروم");
        db.report_channel = channel.id;
        await db.save();
        await interaction.reply({ content: `✅ | تم تعين روم البلاغات بنجاح`, ephemeral: true });

      } else if (interaction.options._subcommand == "الاقيام") {
        let start_game = interaction.options.getChannel("الرحلة");
        let ads = interaction.options.getChannel("التنبيهات");
        let join = interaction.options.getChannel("التسجيلات");
        db.game_channels = {
          start_game: start_game.id,
          ads: ads.id,
          join: join.id
        };
        await db.save();
        await interaction.reply({ content: `✅ | تم تعين رومات الاقيام بنجاح`, ephemeral: true });

      } else if (interaction.options._group == "حالة" && interaction.options._subcommand == "السيرفر") {
        let channel = interaction.options.getChannel("الروم");

        let embed = new Discord.EmbedBuilder()
          .setColor("#003d66")
          .setDescription("**Server Status | Offline**")
          .setImage("https://i.imgur.com/LGcsHp8.jpeg");

        let msg = await channel.send({ embeds: [embed], content: `|| @everyone ||` });

        db.status = { channel: channel.id, message: msg.id };
        await db.save();

        await interaction.reply({ content: `✅ | تم تعين روم حالة السيرفر بنجاح`, ephemeral: true });
      }
    }
  }
};
