const Discord = require("discord.js")

module.exports = {
  name: `delete-all-tickets`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setDescription(`**:white_check_mark: - تم حذف جميع التذاكر الموجودة**`);

    await message.guild.channels.cache.filter(c => c.name.startsWith("ticket-")).forEach(async ch => {
        await ch.delete()
    })

    await message.reply({
      embeds: [embed]
    })

  }
};
