const Discord = require("discord.js");
let cars = require("../../cars.json");

// دعم الحالتين: سواء الملف ملفوف بـ { "cars": [...] } أو Array مباشرة
if (cars.cars) cars = cars.cars;

module.exports = {
    name: `send-message13`,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("8")) return;

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setImage("https://i.postimg.cc/FRqxxWp3/IMG-6773.jpg")
            .setTitle("MWS")
            .setDescription(
                `**From here you can buy your own vehicle and it will be sent directly to your garage, 
                but first of all you must put your money in cash and then choose the vehicle that you want to purchase it**`
            );

        if (!Array.isArray(cars) || cars.length === 0) {
            return message.reply("⚠️ لا توجد سيارات متاحة في cars.json");
        }

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId("cars_menu")
                .setMaxValues(1)
                .setPlaceholder("Select the car")
                .addOptions(
                    cars.map((data, i) => ({
                        emoji: "🚗",
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
