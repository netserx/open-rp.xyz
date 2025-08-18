const guildBase = require('../../Models/guildBase')
  , Blacklisted = require('../../Models/blacklisted')

module.exports = {
  name: `كشف-مخالفين`,
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

    let blacklist_data = await Blacklisted.find({ guild: message.guild.id })
    if (blacklist_data.length <= 0) return message.reply({
      content: `**⚠️ - لا أحد يملك عقوبات حتى الان**`
    })

    console.log(blacklist_data)
/*
    let eheh = new Discord.EmbedBuilder()
      .setColor("#0a95eb")
      .setThumbnail(message.guild.iconURL())
      .setTimestamp()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })

    await message.reply({ embeds: [eheh] })*/








    const allblacklisted = [], max = 5, blacklistes = [...blacklist_data];

    while (blacklistes.length) {
      allblacklisted.push(blacklistes.splice(0, max));
    }

    function generateEmbed(page) {
      const embed = new Discord.EmbedBuilder()
        .setColor("#003d66")
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setDescription(`${allblacklisted[page].map(user => `- **\`${user.user}\`**\n - **السبب :** ${user.reason}\n - **المدة المتبقية :** <t:${Math.floor((user.time)/1000)}:R>`).join("\n\n")}`)

      return embed;
    }

    var currentPage = 0;
    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId("back")
        .setStyle("Secondary")
        .setLabel("back")
        .setDisabled(currentPage == 0),

      new Discord.ButtonBuilder()
        .setCustomId("next")
        .setStyle("Secondary")
        .setDisabled(blacklist_data.length <= max)
        .setLabel("next")
    )

    let msg = await message.reply({
      embeds: [generateEmbed(currentPage)],
      components: [row]
    })

    const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 120000 });
    collector.on('collect', async (i2) => {
      if (i2.user.id != message.author.id) return;

      await i2.deferUpdate();

      if (i2.customId === 'back') {
        currentPage -= 1;

        if (currentPage < 0) currentPage = allblacklisted.length - 1;
      } else if (i2.customId === 'next') {
        currentPage += 1;

        if (currentPage === allblacklisted.length) currentPage = 0;
      }

      await row.components[0].setDisabled(currentPage === 0);
      await row.components[1].setDisabled(currentPage === allblacklisted.length - 1);

      await msg.edit({
        embeds: [generateEmbed(currentPage)],
        components: [row]
      });
    });

    collector.on('end', collected => {
      if (collected.size > 0) return;

      msg.delete();
    });
  }
};
