const guildBase = require('../../Models/guildBase')
  , Blacklisted = require('../../Models/blacklisted')
  , pretty = require("pretty-ms");

module.exports = {
  name: `مخالف`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id })
    if (!db) {
      db = new guildBase({ guild: message.guild.id })
      await db.save()
    }

    if (!db.blacklist) return message.reply({ content: `**⚠️ - لم يتم تعين رتبة المسؤولين عن البلاك ليست حتى الان**` })

    let role = message.guild.roles.cache.get(db.blacklist)
    if (!role) return message.reply({
      content: `**⚠️ - لا استطيع ايجاد رتبة مسؤولين البلاك ليست داخل السيرفر **`
    })

    if (!message.member.roles.cache.has(role.id)) return message.reply({
      content: `**⚠️ - هذا الامر متاح لمسؤولين بلاك ليست فقط**`
    })

    if (db.reasons.length <= 0) return message.reply({ content: `**⚠️ - لا يوجد عقوبات تمت إضافتها حتى الان**` })

    let user = message.mentions.members.first()
    if (!user) return message.reply({
      content: `**⚠️ - يجب عليك تحديد الشخص الذي تريد معاقبته**`
    })

    if (user.user.bot) return message.reply({
      content: `**⚠️ - لا يمكنك معاقبة هذا الشخص ${user} لانه بوت**`
    })

    let blacklist_data = await Blacklisted.findOne({ guild: message.guild.id, user: user.user.id })
    if (blacklist_data) return message.reply({
      content: `**⚠️ - هذا الشخص معاقب بالفعل**`
    })

    let row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId(`blacklist_reasons`)
          .setPlaceholder('Make Selection !')
          .setMaxValues(1)
          .addOptions(db.reasons.map(reason => {
            return { label: `${reason.name}`, value: `${reason.name}`, description: `Time: ${pretty(reason.time)}` }
          }))
      );

    let msg2 = await message.reply({ components: [row] })
    const collector = msg2.createMessageComponentCollector({ componentType: Discord.ComponentType.StringSelect, time: 20000 });
    collector.on('collect', async i2 => {
      if (i2.user.id != message.author.id) return i2.reply({
        content: `**⚠️ - ليس لديك صلاحيات لاستخدام هذا الاختيار**`,
        ephemeral: true
      })

      if (i2.customId.startsWith("blacklist_reasons")) {
        let value = i2.values[0]
        const user_roles = user.roles.cache.filter(role => role.name != "@everyone").map(role => role.id);

        const reason = db.reasons.find(c => c.name.toLowerCase() == value.toLowerCase())
        if (!reason) return;

        let role = message.guild.roles.cache.get(reason.role)
        if (role) {
          await user.roles.add(role.id).catch(() => 0)
        }

        user_roles.forEach(async role => {
          await user.roles.remove(role).catch(() => 0)
        })

        new Blacklisted({
          guild: message.guild.id,
          user: user.user.id,
          reason: value,
          time: reason.time + Date.now(),
          blacklisted_roles: reason.role
        }).save();

        i2.update({
          content: `**  - You have banned this player . **`,
          components: [],
          embeds: []
        })


        let embed = new Discord.EmbedBuilder()
          .setColor("#003d66")
          .setThumbnail(message.guild.iconURL())
          .setTimestamp()
          .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })

        const prv_message = embed.setDescription(`** - Banned . 

 - Player | ${user}

 - You have been banned from the server for violating one of the Rules . 

To know the reason for the ban, review it <#1273885264812441600> 
If you have an objection to the band, open a ticket <#1279345118968811571>  . 

\`\`   . \`\`**`)

        user.send({ embeds: [prv_message] }).catch(() => 0)

        let ban_chat = message.guild.channels.cache.get(db.ban_chat_log)
        if (ban_chat) {
          const ban_chatMSG = embed.setDescription(`** - Banned .

 - Player | ${user}

 - Reason | ${value}

 - Time | ${pretty(reason.time)}

\`\`   . \`\`**`)

          ban_chat.send({ embeds: [ban_chatMSG] })
        }

        let log_chat = message.guild.channels.cache.get(db.ban_log)
        if (log_chat) {
          const log_chatMSG = embed.setDescription(`** - Banned Log .

 - Player | ${user}

 - From | ${message.author}

 - Reason | ${value}

 - Time | ${pretty(reason.time)}

\`\`   . \`\`**`)

          log_chat.send({ embeds: [log_chatMSG] })
        }

        setTimeout(async function () {
          await user.roles.remove(role.id).catch(() => 0)

          /*user_roles.forEach(async role => {
            await user.roles.add(role).catch(() => 0)
          })*/

          await Blacklisted.deleteMany({ guild: message.guild.id, user: user.user.id })
        }, reason.time)
      }
    })
  }
};
