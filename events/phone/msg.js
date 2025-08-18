const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , cooldowns = new Map();

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("createMSG")) {
            await interaction.guild.members.fetch();

            if (cooldowns.has(interaction.user.id)) {
                const dd = cooldowns.get(interaction.user.id);
                const timeNow = Date.now();

                if (timeNow < dd) {
                    const timeLeft = (dd - timeNow) / 1000 / 60;

                    return interaction.reply({
                        content: `:x: | يمكنك إرسالة رسالة واحدة فقط كل 5 دقائق ، حاول مرة أخرى بعد ${timeLeft.toFixed(1)} دقيقة`,
                        ephemeral: true
                    })
                }
            }

            let data = await guildBase.findOne({ guild: interaction.guild.id })

            let check = data.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام رسائل الهاتف`,
                ephemeral: true
            })

            const Discord_ID = interaction.fields.getTextInputValue('discord_id')
                , MESSAGE = interaction.fields.getTextInputValue('msg');

            let member = interaction.guild.members.cache.get(Discord_ID)
            if (!member) return interaction.reply({
                content: `:x: | تعذر إيجاد العضو تأكد من الايدي الخاص به`,
                ephemeral: true
            })

            if(Discord_ID === interaction.user.id) return interaction.reply({
                content: `:x: | لا يمكنك إرسالة رسالة لنفسك`,
                ephemeral: true
            })

            let userData = await userBase.findOne({ user: interaction.user.id, guild: interaction.guild.id })
            userData = userData[check.character]

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** - رسالة واردة

 - المرسل | ${userData.id.first}

 - الرسالة | ${MESSAGE}

\`\`   . \`\`**`);

            member.send({
                content: `${interaction.user}`,
                embeds: [embed]
            }).then(() => {
                cooldowns.set(interaction.user.id, Date.now() + 5 * 60 * 1000);

                return interaction.reply({
                    content: `:white_check_mark: | تم إرسال الرسالة بنجاح`,
                    ephemeral: true
                })
            }).catch(() => {
                return interaction.reply({
                    content: `:x: | تعذر إرسال الرسالة للعضو ، ربما خاصه مغلق`,
                    ephemeral: true
                })
            })
        }
    }
};