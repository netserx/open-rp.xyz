const Discord = require("discord.js")

module.exports = {
  name: `send-message2`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setAuthor({ name: "Game Selection" })
      .setImage("https://i.imgur.com/6taQUJQ.png")
      .setDescription(`**- Choose You Want**`);

    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
      .setCustomId("game_start")
      .setLabel("بدأ رحلة")
      .setStyle("Success"),

      new Discord.ButtonBuilder()
      .setCustomId("game_end")
      .setLabel("إعصار")
      .setStyle("Danger"),

      new Discord.ButtonBuilder()
      .setCustomId("game_renew")
      .setLabel("تجديد")
      .setStyle("Secondary"),

      new Discord.ButtonBuilder()
      .setCustomId("game_alert")
      .setLabel("تنبيه")
      .setStyle("Secondary")
    )

    message.delete();
    await message.channel.send({
      embeds: [embed],
      components: [row]
    })

  }
};
