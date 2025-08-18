const Discord = require("discord.js")

module.exports = {
  name: `send-message3`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("8")) return;

    let embed = new Discord.EmbedBuilder()
      .setColor("#003d66")
      .setImage("https://i.imgur.com/LGcsHp8.jpeg")
      .setDescription(`** -   \n\n - الرجاء الضغط على الخيار في الاسفل لأظهار جميع انواع التكتات .

 - قم باختيار القسم الصحيح لفتح التذكرة .**`);

    let row = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setMaxValues(1)
        .setPlaceholder("Make Selection !")
        .addOptions([
          { label: "Support Ticket .", value: "support"},
          { label: "Complaint Ticket .", value: "comp"},
          { label: "High Management Ticket .", value: "high"},
          { label: "Add item Ticket .", value: "add"},
          { label: "Store Ticket .", value: "store"}
        ])
    )

    message.delete();
    await message.channel.send({
      embeds: [embed],
      components: [row]
    })

  }
};
