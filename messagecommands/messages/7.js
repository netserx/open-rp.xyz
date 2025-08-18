const Discord = require("discord.js")

module.exports = {
  name: `send-message7`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setImage("https://i.imgur.com/LGcsHp8.jpeg")
      .setDescription(`** - قم باختيار حالة السيرفر**`);

    let row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
        .setCustomId("status_online")
        .setLabel("Online")
        .setStyle("Secondary"),
        
        new Discord.ButtonBuilder()
        .setCustomId("status_offline")
        .setLabel("Offline")
        .setStyle("Secondary"),

        new Discord.ButtonBuilder()
        .setCustomId("status_busy")
        .setLabel("Busy")
        .setStyle("Secondary")
    )

    message.delete();
    await message.channel.send({
      embeds: [embed],
      components: [row]
    })

  }
};
