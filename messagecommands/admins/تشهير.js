const Discord = require("discord.js")

module.exports = {
  name: `تشهير`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setDescription(`> **أملأ الاستبيان حتى تتم عملية التشهير**`);

    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`tshherStart_${message.author.id}`)
        .setLabel("بدء الاستبيان")
        .setStyle("Secondary")
    )

    await message.reply({
      embeds: [embed],
      components: [row]
    })

  }
};
