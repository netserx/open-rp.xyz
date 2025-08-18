const Discord = require("discord.js")

module.exports = {
  name: `send-message`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setAuthor({ name: "Character Selection" })
      .setImage("https://i.imgur.com/zu4qMKo.png")
      .setDescription(`** - Choose Your Character**`);

    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId("choose_character")
        .setMaxValues(1)
        .setPlaceholder("choose character")
        .addOptions([
          { label: "character 1", value: "c1" },
          { label: "character 2", value: "c2" }
        ])
    )

    message.delete();
    await message.channel.send({
      embeds: [embed],
      components: [row]
    })

  }
};
