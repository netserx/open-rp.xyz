const guildBase = require('../../Models/guildBase')
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: `رومات`,
    description: "لتعين الرومات",
    default_member_permissions: "0x0000000000000008",
    options: [
        {
            name: "المباشرين",
            description: "لتعين روم حالة السيرفر",
            type: 1,
            options: [
                {
                    name: "تسجيل_الدخول",
                    type: 7,
                    channel_types: [0],
                    description: "ارفق الروم الذي تريد تعينه لتسجيل الدخول والخروج",
                    required: true
                },
                {
                    name: "قائمة_المباشرين",
                    type: 7,
                    channel_types: [0],
                    description: "ارفق الروم الذي تريد تعينه لقائمة المباشرين",
                    required: true
                },
                {
                    name: "الاولوية",
                    type: 7,
                    channel_types: [0],
                    description: "ارفق الروم الذي تريد تعينه للاولوية",
                    required: true
                },
            ]
        }
    ],
    run: async (client, interaction, Discord) => {
        if (interaction.commandName == "رومات") {
            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save()
            }

            if (interaction.options._subcommand == "المباشرين") {
                let loginChannel = interaction.options.getChannel("تسجيل_الدخول")
                let listChannel = interaction.options.getChannel("قائمة_المباشرين")
                let firstChannel = interaction.options.getChannel("الاولوية")

                let loginEmbed = new EmbedBuilder()
                    .setColor("#030292")
                    .setFooter({ text: "MDT" })
                    .setThumbnail("https://i.imgur.com/LdAJ8gV.jpeg")
                    .setDescription(`** - Police List .

 - Login to the Police list .**`);

                let row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("loginpolice_join")
                        .setLabel("Login")
                        .setStyle("Secondary"),

                    new ButtonBuilder()
                        .setCustomId("loginpolice_leave")
                        .setLabel("Logout")
                        .setStyle("Secondary")
                )

                loginChannel.send({
                    embeds: [loginEmbed],
                    components: [row]
                })

                let listEmbed = new EmbedBuilder()
                    .setColor("#030292")
                    .setThumbnail(" ")
                    .setDescription(`** - Police List .

${db.policejoins.map((b, i) => `${i + 1} - ${b?.name} `).join("\n")}

\`\` Police System . \`\`**`);

                let msg = await listChannel.send({
                    embeds: [listEmbed]
                })

                db.joinChannels = { login: loginChannel.id, list: listChannel.id, first: firstChannel.id }
                db.listMessage = msg.id
                await db.save()

                await interaction.reply({ content: `:white_check_mark: | تم تعين رومات المباشرين بنجاح`, ephemeral: true })
            }
        }
    }
};
