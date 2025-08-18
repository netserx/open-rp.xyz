const Discord = require("discord.js")
const { prices } = require("../../config.json")

module.exports = {
    name: `send-message6`,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("8")) return;

        let embed = new Discord.EmbedBuilder()
            .setColor("#ca1111")
            .setImage("https://i.postimg.cc/vZd3jKsv/IMG-6796.jpg")
            .setDescription(`**From here you can assemble, manufacture and develop, but you must choose between them and start assembling to make the turns easier for you**`);

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId("mach_menu")
                .setMaxValues(1)
                .setPlaceholder("Choose a product")
                .addOptions([
                    { label: "Manufacturing", value: "manufacturing", description: `لبدء التصنيع` },
                    { label: "Collecting", value: "collecting", description: `لبدء التجميع` },
                    { label: "Upgrade", value: "upgrade", description: `لبدء التطوير` },
                ])
        )

        message.delete();
        await message.channel.send({
            embeds: [embed],
            components: [row]
        })

    }
};
