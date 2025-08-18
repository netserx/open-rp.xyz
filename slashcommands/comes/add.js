const guildBase = require('../../Models/guildBase')
const ms = require('ms')

module.exports = {
  name: `اضافة`,
  description: "للاضافات",
  default_member_permissions: "0x0000000000000008",
  options: [
    {
      name: "استدعاء",
      description: "لإضافة استدعاءات جديدة",
      type: 1,
      options: [
        {
          name: "الاسم",
          type: 3,
          description: "ارفق نوع الاستدعاء الذي تريد اضافته",
          required: true
        }
      ]
    },
    {
      name: "عقوبة",
      description: "لإضافة عقوبات جديدة",
      type: 1,
      options: [
        {
          name: "الاسم",
          type: 3,
          description: "ارفق نوع الباند الذي تريد اضافته",
          required: true
        },
        {
          name: "المدة",
          type: 3,
          description: "أرفق مدة الباند الذي تريد إضافتها",
          required: true
        },
        {
          name: "الرتبة",
          type: 8,
          description: "أرفق الرتبة الذي تريد اضافتها للعضو بعد حصوله على الباند",
          required: true
        }
      ]   
    }
  ],
  run: async (client, interaction, Discord) => {
    if (interaction.commandName == "اضافة") {
      let db = await guildBase.findOne({ guild: interaction.guild.id })
      if (!db) {
        db = new guildBase({ guild: interaction.guild.id })
        await db.save()
      }

      if (interaction.options._subcommand == "استدعاء") {
        if(db.comes.all.length >= 25) return interaction.reply({
            content: `:x: | لقد وصلت للحد الاقصى من الاستدعاءات`,
            ephemeral: true
        })
        
        let name = interaction.options.getString("الاسم")

        db.comes.all.push(name)
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم اضافة استدعاء جديد بنجاح`, ephemeral: true })
      } else if (interaction.options._subcommand == "عقوبة") {
        if(db.reasons.length >= 25) return interaction.reply({
            content: `:x: | لقد وصلت للحد الاقصى من العقوبات`,
            ephemeral: true
        })
        
        const name = interaction.options.getString("الاسم")
        const time = interaction.options.getString("المدة")
        if(!ms(time)) return interaction.reply({
          content: `:x: | يجب أن ترفق الوقت بشكل صحيح`,
          ephemeral: true
        })
        const role = interaction.options.getRole("الرتبة")

        const check = db.reasons.find(reason => reason.name.toLowerCase() === name.toLowerCase())
        if(check) return interaction.reply({
          content: `:x: | تم إضافة هذه العقوبة من قبل`,
          ephemerl: true
        })

        db.reasons.push({ name: name, role: role.id, time: ms(time) })
        await db.save()

        await interaction.reply({ content: `:white_check_mark: | تم اضافة عقوبة جديدة بنجاح`, ephemeral: true })
      }
    }
  }
};
