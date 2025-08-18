const Discord = require("discord.js")
module.exports = {
    name: `send-message15`,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("8")) return;

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setImage("https://i.imgur.com/ySzKoxU.jpeg")
            .setTitle(`**<:BR8:1372832911543500901> - Storage ( 2 ) 

<:BR8:1372832911543500901> - To receive military equipment, click Next . 


\`\`  Police \`\`**`);

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("2take_items")
                .setStyle("Success")
                .setLabel("Take")
        )
        
        message.delete();
        await message.channel.send({
            embeds: [embed],
            components: [row]
        })

    }
};
