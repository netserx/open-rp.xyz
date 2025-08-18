const userBase = require('../../Models/userBase')
  , guildBase = require('../../Models/guildBase')
  , { invLog } = require("../../config.json");

module.exports = {
  name: `reset-all-items`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id })
    if (!db) {
      db = new guildBase({ guild: message.guild.id })
      await db.save()
    }

    if (!db.inv_admin) return message.reply({
      content: `:x: | تعذر الاستخدام بسبب عدم تعيين مسؤولين الحقيبة`
    })

    if (!message.guild.roles.cache.get(db.inv_admin)) return message.reply({
      content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`
    })

    if (!message.member.roles.cache.has(db.inv_admin)) return message.reply({
      content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك غير مسؤول عن الحقيبة`
    })

    let role = message.mentions.roles.first();
    if (!role) return message.reply({
      content: `:x: | يجب عليك منشن الرتبة الذي تريد تصفير حقيبتها`
    })

    let character = args[1], only = ["1", "2"]
    if (!character || !only.includes(character)) return message.reply({
      content: `:x: | يجب عليك تحديد الشخصية الذي تريد تصفير اغراضها 1 / 2`
    })

    await role.guild.members.fetch();

    let row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
            .setCustomId(`resetinv_all_confirm`)
            .setLabel("تأكيد")
            .setStyle("Success"),

        new Discord.ButtonBuilder()
            .setCustomId(`invcancel`)
            .setLabel("إلغاء")
            .setStyle("Danger")
    )

    let embed = new Discord.EmbedBuilder()
        .setColor("#003d66")
        .setDescription(`> **هل أنت متأكد أنك تريد تصفير جميع حقائب الشخصية ${character === "1" ? "الاولى" : "الثانية"} لأعضاء رتبة ${role}**`)

    let msg = await message.reply({
        embeds: [embed],
        components: [row]
    })

    const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 20000 })
    collector.on('collect', async i => {
        if (i.user.id != message.author.id) return i.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر`,
            ephemeral: true
        })

        if (i.customId === "resetinv_all_confirm") {
            role.members.filter(c => !c.user.bot).forEach(async member => {
                await userBase.updateOne({ guild: message.guild.id, user: member.user.id },
                    {
                      $set: {
                        [`${character === "1" ? "c1" : "c2"}.inv`]: []
                      }
                    }
                  );
            });

            await msg.edit({
                components: [],
                embeds: [new Discord.EmbedBuilder()
                  
                  .setDescription(`:white_check_mark: | تم تصفير حقيبة الشخصية ${character === "1" ? "الاولى" : "الثانية"} من أعضاء رتبة ${role} بنجاح`)]
            })

            let log = message.guild.channels.cache.get(invLog)
            if (!log) return;
    
            log.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** تم اعادة تعيين الحقيبة | ${role}

 - من قبل | ${message.author}

 - الشخصية | ${character}

  .**`)]
            })
        } else if (i.customId === "invcancel") {
            i.deferUpdate();

            await msg.edit({
                content: `:white_check_mark: | تم إلغاء عملية التصفير`,
                components: [],
                embeds: []
            })
        }
    });

    collector.on('end', collect => {
        if(collect.first()) return;
        
        msg.edit({ content: "أنتهى الوقت", embeds: [], components: [] })
    });
  }
};
