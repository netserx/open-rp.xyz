const Discord = require("discord.js")

module.exports = {
  name: `send-message10`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setImage("https://i.imgur.com/aL2Qf1s.jpeg")
      .setDescription(`**قم باختيار الانعاش**`);

    let row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
        .setCustomId("en3ash_main")
        .setLabel("إنعاش")
        .setDisabled(true)
        .setStyle("Secondary"),
        
        new Discord.ButtonBuilder()
        .setCustomId("en3ash_hospital")
        .setLabel("إنعاش مستشفى")
        .setStyle("Secondary"),

        new Discord.ButtonBuilder()
        .setCustomId("en3ash_magic")
        .setLabel("إنعاش ساحرة")
        .setStyle("Secondary")
    )

    message.delete();
    await message.channel.send({
      embeds: [embed],
      components: [row]
    })

  }
};
