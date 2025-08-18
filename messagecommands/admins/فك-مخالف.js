const guildBase = require('../../Models/guildBase');
const Blacklisted = require('../../Models/blacklisted');

module.exports = {
  name: `ازالة-مخالف`,
  run: async (client, message, args, Discord) => {
    let db = await guildBase.findOne({ guild: message.guild.id });
    if (!db) {
      db = new guildBase({ guild: message.guild.id });
      await db.save();
    }

    if (!db.blacklist) {
      return message.reply({ content: `**⚠️ - لم يتم تعين رتبة المسؤولين عن البلاك ليست حتى الان**` });
    }

    let role = message.guild.roles.cache.get(db.blacklist);
    if (!role) {
      return message.reply({ content: `**⚠️ - لا استطيع ايجاد رتبة مسؤولين البلاك ليست داخل السيرفر **` });
    }

    if (!message.member.roles.cache.has(role.id)) {
      return message.reply({ content: `**⚠️ - هذا الامر متاح لمسؤولين بلاك ليست فقط**` });
    }

    let user = message.mentions.members.first();
    if (!user) {
      return message.reply({ content: `**⚠️ - يجب عليك تحديد الشخص الذي تريد فك حظره**` });
    }

    let blacklist_data = await Blacklisted.findOne({ guild: message.guild.id, user: user.user.id });

    if (!blacklist_data || user.user.bot) {
      return message.reply({ content: `**⚠️ - ${user} لا يملك أي عقوبات**` });
    }

    // إزالة جميع الرتب الحالية ما عدا everyone
    const rolesToRemove = user.roles.cache.filter(role => role.name !== "@everyone").map(role => role.id);
    for (const roleId of rolesToRemove) {
      await user.roles.remove(roleId).catch(() => 0);
    }

    // إعادة الرتب المخزنة
    if (Array.isArray(blacklist_data.roles)) {
      for (const roleId of blacklist_data.roles) {
        await user.roles.add(roleId).catch(() => 0);
      }
    }

    // حذف من قاعدة بيانات البلاك ليست
    await Blacklisted.deleteMany({ guild: message.guild.id, user: user.user.id });

    await message.reply({ content: `:**  - You have unbanned this player . **` });

    // إنشاء Embed للإشعارات
    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setThumbnail(message.guild.iconURL())
      .setTimestamp()
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

    // إرسال رسالة خاصة للمستخدم
    const prv_message = embed.setDescription(`** - UnBanned .

 - Player | ${user}

 - You have been unbanned .

\`\`   . \`\`**`);
    await user.send({ embeds: [prv_message] }).catch(() => 0);

    // إرسال إلى لوق البان
    let log_chat = message.guild.channels.cache.get(db.ban_log);
    if (log_chat) {
      const log_chatMSG = embed.setDescription(`** - UnBanned Log .

 - Player | ${user}

 - From | ${message.author}

\`\`   . \`\`**`);
      log_chat.send({ embeds: [log_chatMSG] });
    }
  }
};
