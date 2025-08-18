const Discord = require("discord.js");
let builds = require("../../builds.json");

// دعم الحالتين: سواء الملف ملفوف بـ { "builds": [...] } أو Array مباشرة
if (builds.builds) builds = builds.builds;

module.exports = {
    name: `send-message12`,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("8")) return;

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setImage("https://i.imgur.com/ixKPd39.png")
            .setTitle("<:BR8:1372832911543500901> - Real Estate .")
            .setDescription(
                `**__Apartment You have to press the bottom button <:BR8:1372832911543500901> 
                and you have to choose the house__**`
            );

        if (!Array.isArray(builds) || builds.length === 0) {
            return message.reply("⚠️ لا توجد مباني متاحة في builds.json");
        }

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId("builds_menu")
                .setMaxValues(1)
                .setPlaceholder("Select the property")
                .addOptions(
                    builds.map((data, i) => ({
                        label: data.name,
                        description: `Price | ${data.price.toLocaleString("en-US")}`,
                        value: `${i}`
                    }))
                )
        );

        await message.delete().catch(() => {});
        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
};
