const Discord = require('discord.js');

module.exports = {
    name: 'c',
    run: async (client, message, args) => {
        const embed = new Discord.EmbedBuilder()
            .setColor('#00aaff')
            .setTitle('لوحة التحكم')
            .setDescription('اضغط أحد الأزرار لتشغيل الأمر مباشرة');

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('run_myhouse')
                .setLabel('🏠 عقاراتي')
                .setStyle(Discord.ButtonStyle.Primary),

            new Discord.ButtonBuilder()
                .setCustomId('run_inv')
                .setLabel('🎒 حقيبتي')
                .setStyle(Discord.ButtonStyle.Success),

            new Discord.ButtonBuilder()
                .setCustomId('run_id')
                .setLabel('🪪 هويتي')
                .setStyle(Discord.ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
};
