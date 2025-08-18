const userBase = require('../../Models/userBase');
const guildBase = require('../../Models/guildBase');
const Discord = require('discord.js');

module.exports = {
    name: `كشف-حقيبة`,
    run: async (client, message, args) => {
        let db = await guildBase.findOne({ guild: message.guild.id });
        if (!db) {
            db = new guildBase({ guild: message.guild.id });
            await db.save();
        }

        let check = db.joins.find(c => c.user === message.author.id);
        if (!check) return message.reply({
            content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام هذا الامر`
        });

        let data = await userBase.findOne({ guild: message.guild.id, user: message.author.id });
        if (!data) {
            data = new userBase({ guild: message.guild.id, user: message.author.id });
            await data.save();
        }

        data = data[check.character];
        if (data.clamped) return message.reply({
            content: `** - انت مكلبش لايمكنك استخدام هذا الامر**`
        });

        let user = message.mentions.users.first();
        if (!user) return message.reply({
            content: `:x: | يجب عليك ذكر الشخص الذي تريد كشف حقيبته`
        });

        let check2 = db.joins.find(c => c.user === user.id);
        if (!check2) return message.reply({
            content: `:x: | لا يمكنك كشف حقيبة ${user} لانه غير مسجل دخول`
        });

        // جلب بيانات الشخص المستهدف
        let userData = await userBase.findOne({ guild: message.guild.id, user: user.id });
        if (!userData || !userData[check2.character]?.inv?.length) {
            return message.reply({
                content: `:x: | ${user} لا يملك أي أغراض داخل الحقيبة`
            });
        }

        userData = userData[check2.character];

        // تجهيز الصفحات
        const allinvs = [], max = 5, inv = [...userData.inv.sort((a, b) => b.count - a.count)];
        while (inv.length) allinvs.push(inv.splice(0, max));

        function generateEmbed(page) {
            return new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setDescription(`** - Name | ${userData.id.first}

${allinvs[page].map((value, i) => `${i + 1} | ${value.name}\n- Amount | ${value.count}`).join("\n\n")}**`);
        }

        let currentPage = 0;
        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("back")
                .setStyle(Discord.ButtonStyle.Secondary)
                .setLabel("back")
                .setDisabled(true),
            new Discord.ButtonBuilder()
                .setCustomId("next")
                .setStyle(Discord.ButtonStyle.Secondary)
                .setDisabled(allinvs.length <= 1)
                .setLabel("next")
        );

        let msg2 = await message.reply({
            embeds: [generateEmbed(currentPage)],
            components: [row]
        });

        // التحكم في الصفحات
        const collector2 = msg2.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 120000 });
        collector2.on('collect', async (i2) => {
            if (i2.user.id != message.author.id) return;
            await i2.deferUpdate();

            if (i2.customId === 'back') currentPage--;
            else if (i2.customId === 'next') currentPage++;

            await row.components[0].setDisabled(currentPage === 0);
            await row.components[1].setDisabled(currentPage === allinvs.length - 1);

            await msg2.edit({ embeds: [generateEmbed(currentPage)], components: [row] });
        });
    }
 };
