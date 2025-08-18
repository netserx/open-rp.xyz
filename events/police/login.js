const Discord = require('discord.js'),
      guildBase = require('../../Models/guildBase'),
      { addPolicePoint, checkCount } = require('../../functions'), // تأكد تضيف checkCount هنا
      userBase = require("../../Models/userBase");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("loginpolice_")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id });
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id });
                await data.save();
            }

            if (!data.police_admin) return interaction.reply({
                content: `:x: | تعذر استخدام الامر بسبب عدم تعيين رتبة العساكر`,
                ephemeral: true
            });

            if (!interaction.guild.roles.cache.get(data.police_admin)) return interaction.reply({
                content: `:x: | تعذر استخدام الامر بسبب عدم إيجاد رتبة العساكر داخل السيرفر`,
                ephemeral: true
            });

            if (!interaction.member.roles.cache.has(data.police_admin)) return interaction.reply({
                content: `:x: | هذا الزر للعساكر فقط`,
                ephemeral: true
            });

            let check = data.joins.find(c => c.user === interaction.user.id);
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك في القيم حتى تتمكن من استخدام الزر`,
                ephemeral: true
            });

            let db = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id });
            if (!db) {
                db = new userBase({ guild: interaction.guild.id, user: interaction.user.id });
                await db.save();
            }

            db = db[check.character];
            let value = interaction.customId.split("_")[1];

            if (value === "join") {
                await addPolicePoint(interaction.guild.id, interaction.user.id, check.character, "login", 4);

                if (data.policejoins.find(c => c.user === interaction.user.id)) return interaction.reply({
                    content: `:x: | أنت مسجل دخول بالفعل`,
                    ephemeral: true
                });

                data.policejoins.push({ user: interaction.user.id, name: db.id.first, character: check.character });
                await data.save();

                let listChannel = interaction.guild.channels.cache.get(data.joinChannels.list);
                if (!listChannel) return interaction.reply({
                    content: `:x: | لا استطيع إيجاد روم قائمة المباشرين`,
                    ephemeral: true
                });

                let listMessage = await listChannel.messages.fetch(data.listMessage);
                if (!listMessage) return interaction.reply({
                    content: `:x: | لا أستطيع إيجاد رسالة قائمة المباشرين`,
                    ephemeral: true
                });

                let embed = Discord.EmbedBuilder.from(listMessage.embeds[0])
                    .setDescription(`** - Police List .\n\n${data.policejoins.map((b, i) => `${i + 1} - ${b.name}`).join("\n")}\n\n\`\` Police System . \`\`**`);

                await listMessage.edit({ embeds: [embed] });

                // 🔹 تحديث الأولوية
                await checkCount(interaction.guild);

                await interaction.reply({
                    content: `:white_check_mark: - تم تسجيلك بنجاح`,
                    ephemeral: true
                });

            } else {
                let index = data.policejoins.findIndex(c => c.user === interaction.user.id);
                if (index == -1) return interaction.reply({
                    content: `:x: | يجب تسجيل دخولك اولا`,
                    ephemeral: true
                });

                data.policejoins.splice(index, 1);
                await data.save();

                let listChannel = interaction.guild.channels.cache.get(data.joinChannels.list);
                if (!listChannel) return interaction.reply({
                    content: `:x: | لا استطيع إيجاد روم قائمة المباشرين`,
                    ephemeral: true
                });

                let listMessage = await listChannel.messages.fetch(data.listMessage);
                if (!listMessage) return interaction.reply({
                    content: `:x: | لا أستطيع إيجاد رسالة قائمة المباشرين`,
                    ephemeral: true
                });

                let embed = Discord.EmbedBuilder.from(listMessage.embeds[0])
                    .setDescription(`** - Police List .\n\n${data.policejoins.map((b, i) => `${i + 1} - ${b.name}`).join("\n")}\n\n\`\` Police System . \`\`**`);

                await listMessage.edit({ embeds: [embed] });

                // 🔹 تحديث الأولوية
                await checkCount(interaction.guild);

                await interaction.reply({
                    content: `:white_check_mark: - تم تسجيل خروجك بنجاح`,
                    ephemeral: true
                });
            }
        }
    }
};
