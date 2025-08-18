const Discord = require("discord.js")
const { embedColor } = require("../../config.json");

module.exports = {
  name: `send-message`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#a84300")
      .setAuthor({ name: "Character" })
      .setImage("https://i.postimg.cc/7Zs3nr1y/e12daea658042ba3f07b9f87691d0d19aa237079.jpg")
      .setDescription(`**From here you can choose the character you want to enter the trip with, and you can also create a character and write all the information**`);

    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId("choose_character")
        .setMaxValues(1)
        .setPlaceholder("choose character")
        .addOptions([
          { label: "character 1", value: "c1" },
          { label: "character 2", value: "c2"}
        ])
    )

    message.delete();
    await message.channel.send({
      embeds: [embed],
      components: [row]
    })

  }
};
