const Discord = require("discord.js")

module.exports = {
  name: `send-message11`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setImage("https://i.imgur.com/MFfB5ID.jpeg")
      .setDescription(`**<:BR8:1372832911543500901> - Phone .**`);

    let row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
        .setCustomId("phone_users")
        .setLabel("جهات الاتصال")
        .setStyle("Secondary"),
        
        new Discord.ButtonBuilder()
        .setCustomId("phone_msg")
        .setLabel("الرسائل")
        .setStyle("Secondary")
    )

    message.delete();
    await message.channel.send({
      embeds: [embed],
      components: [row]
    })

  }
};
