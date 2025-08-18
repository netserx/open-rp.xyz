const Discord = require('discord.js');

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        // زر تشغيل أمر myHouse
        if (interaction.customId === "run_myhouse") {
            try {
                const myHouseCmd = require('../../messagecommands/public/myHouse');
                await myHouseCmd.run(client, interaction, []);
            } catch (err) {
                console.error("Error running myHouse from panel:", err);
                await interaction.reply({
                    content: "❌ | حصل خطأ أثناء تشغيل أمر myHouse",
                    ephemeral: true
                });
            }
        }

        // زر تشغيل أمر inv
        if (interaction.customId === "run_inv") {
            try {
                const invCmd = require('../../messagecommands/public/inv');
                await invCmd.run(client, interaction, []);
            } catch (err) {
                console.error("Error running inv from panel:", err);
                await interaction.reply({
                    content: "❌ | حصل خطأ أثناء تشغيل أمر الحقيبة",
                    ephemeral: true
                });
            }
        }

        // زر تشغيل أمر checkid (هويتي)
        if (interaction.customId === "run_id") {
            try {
                const idCmd = require('../../messagecommands/public/checkid');
                await idCmd.run(client, interaction, []);
            } catch (err) {
                console.error("Error running checkid from panel:", err);
                await interaction.reply({
                    content: "❌ | حصل خطأ أثناء تشغيل أمر الهوية",
                    ephemeral: true
                });
            }
        }
    }
};
