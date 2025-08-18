const Discord = require('discord.js'),
    guildBase = require('../../Models/guildBase'),
    userBase = require('../../Models/userBase'),
    { addPoint } = require("../../functions");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("status")) {
            if (!interaction.member.permissions.has("8")) return interaction.reply({
                content: `:x: | ليس لديك صلاحيات لاستخدام هذه الأزرار`,
                ephemeral: true
            });

            let data = await guildBase.findOne({ guild: interaction.guild.id });
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id });
                await data.save();
            }

            if (!data.status) return interaction.reply({
                content: `:x: | لا أستطيع إيجاد روم حالة السيرفر`,
                ephemeral: true
            });

            let channel = interaction.guild.channels.cache.get(data.status.channel);
            if (!channel) return interaction.reply({
                content: `:x: | لا أستطيع إيجاد روم حالة السيرفر`,
                ephemeral: true
            });

            let fetchedMessage;
            try {
                fetchedMessage = await channel.messages.fetch(data.status.message);
            } catch (err) {
                if (err.code === 10008) {
                    return interaction.reply({
                        content: `:x: | لا أستطيع إيجاد رسالة الحالة (ربما تم حذفها؟)`,
                        ephemeral: true
                    });
                } else {
                    console.error("Unexpected Error:", err);
                    return interaction.reply({
                        content: `❌ | حدث خطأ غير متوقع أثناء محاولة جلب الرسالة.`,
                        ephemeral: true
                    });
                }
            }

            let choice = interaction.customId.split("_")[1],
                emoji = choice === "online" ? ":green_circle:" : choice === "offline" ? ":red_circle:" : ":orange_circle:";

            const embed = Discord.EmbedBuilder.from(fetchedMessage.embeds[0])
                .setDescription(`**Server Status | ${choice.charAt(0).toUpperCase() + choice.slice(1)} ${emoji}**`);

            await fetchedMessage.edit({ embeds: [embed] });

            await interaction.reply({
                content: `:white_check_mark: | تم تغيير حالة السيرفر`,
                ephemeral: true
            });
        }
    }
};
