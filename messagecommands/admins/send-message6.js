const Discord = require("discord.js")
const { prices } = require("../../config.json")

module.exports = {
    name: `send-message6`,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("8")) return;

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setImage("https://i.imgur.com/2Gs9gQ1.png")
            .setDescription(`** - For start your manufacturing journey choose the department you want 
And read the Rules here <#1272656958947721309>**`);

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId("mach_menu")
                .setMaxValues(1)
                .setPlaceholder("Choose a product")
                .addOptions([
                    { label: "Collecting", value: "collecting", description: `لبدء التجميع` },
                    { label: "Manufacturing", value: "manufacturing", description: `لبدء التصنيع` },
                ])
        )

        message.delete();
        await message.channel.send({
            embeds: [embed],
            components: [row]
        })

    }
};
