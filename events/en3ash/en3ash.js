const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { addPoint } = require("../../functions")
    , { magic_images, hospital_image } = require("../../config.json");

const hurts = [
    { name: "كدمات في اليد ، كسر في الكتف", price: 600 },
    { name: "كسر في الحوض ، كسر في اليد", price: 800 },
    { name: "نزيف في الأنف", price: 100 },
    { name: "كسر في العمود الفقري ، كسر في اليد ، كسر في الكتف", price: 1100 }
]

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("en3ash")) {
            let value = interaction.customId.split("_")[1]

            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            let check = data.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك حتى تتمكن من استخدام الزر`,
                ephemeral: true
            })

            if (value === "main") {

            } else if (value === "hospital") {
                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setImage(`${hospital_image}`)

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })

                let random = Math.floor(Math.random() * hurts.length)
                if(random > 3) random = 2

                setTimeout(function () {
                    let row = new Discord.ActionRowBuilder().addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId(`gen3ashhBuy_hospital_${hurts[random].price}`)
                            .setLabel("Buy")
                            .setStyle("Success"),

                        new Discord.ButtonBuilder()
                            .setCustomId(`gen3ashhCancel_hospital_${hurts[random].price}`)
                            .setLabel("Cancel")
                            .setStyle("Danger")
                    )

                    interaction.editReply({
                        components: [row],
                        embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - سجلك الصحي

 - الإصابات | ${hurts[random].name}

 - تكلفة الانعاش | ${hurts[random].price} 

\`\`  \`\` **`)]
                    })
                }, 7000)
            } else if (value === "magic") {
                if (!data.magic_admin) return interaction.reply({
                    content: `:x: | خطأ بسبب عدم تعيين رتبة المسؤولين`,
                    ephemeral: true
                })

                if (!interaction.guild.roles.cache.get(data.magic_admin)) return interaction.reply({
                    content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`,
                    ephemeral: true
                })

                if (!interaction.member.roles.cache.has(data.magic_admin)) return interaction.reply({
                    content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك لست مسؤول`,
                    ephemeral: true
                })

                let random = Math.floor(Math.random() * magic_images.length)
                if (random > 1) random = 1

                let embed = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setImage(`${magic_images[random]}`)

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })

                setTimeout(function () {
                    let row = new Discord.ActionRowBuilder().addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId(`gen3ashhBuy_magic_2800`)
                            .setLabel("Buy")
                            .setStyle("Success"),

                        new Discord.ButtonBuilder()
                            .setCustomId(`gen3ashhCancel_magic_2800`)
                            .setLabel("Cancel")
                            .setStyle("Danger")
                    )

                    interaction.editReply({
                        components: [row],
                        embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - الساحرة

 - تكلفة الانعاش | 2800

\`\`  \`\`**`)]
                    })
                }, 7000)
            }
        }
    }
};
