const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { addPoint } = require("../../functions");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("reject")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            if (!data.idd || !data.idd.admin) return interaction.reply({
                content: `:x: | تعذر رفض الهوية بسبب عدم تعيين مسؤولين الهويات`,
                ephemeral: true
            })

            if(!interaction.guild.roles.cache.get(data.idd.admin)) return interaction.reply({
                content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`,
                ephemeral: true
            })

            if(!interaction.member.roles.cache.has(data.idd.admin)) return interaction.reply({
                content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر لانك غير مسؤول عن الهويات`,
                ephemeral: true
            })

            const userId = interaction.customId.split("_")[1]
            const character = interaction.customId.split("_")[2]

            let db = await userBase.findOne({ guild: interaction.guild.id, user: userId })
            db = db[character]

            const row = Discord.ActionRowBuilder.from(interaction.message.components[0]);
            row.components.forEach(button => button.setDisabled(true));

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                .setDescription(`** - تم رفض هويتك

يرجى قراءة القوانين بشكل جيد واعادة التقديم مره اخرى**`);

            let row2 = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/channels/953497803617890314/1218052192863391844")
                    .setLabel("Character Rules")
            )

            await userBase.updateOne({ guild: interaction.guild.id, user: userId },
                {
                    $set: {
                        [`${character}.id`]: {}
                    }
                }
            );

            interaction.message.edit({
                components: [row]
            })

            let member = interaction.guild.members.cache.get(userId)
            if (!member) return interaction.reply({
                content: `:x: | لا أستطيع ايجاد هذا العضو داخل السيرفر لذلك تعذر إرسال رسالة الرفض`
            })

            member.send({
                components: [row2],
                embeds: [embed]
            })

            await interaction.reply({
                content: `:white_check_mark: | تم رفض الهوية`,
                ephemeral: true
            })

            addPoint(interaction.guild.id, interaction.user.id, "id", 1)

            if(!data.idd.log) return;

            let ch = interaction.guild.channels.cache.get(data.idd.log)
            if(!ch) return;

            ch.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - تم رفض هوية | ${member}

 - رقم الشخصية | ${character === "c1" ? "1" : "2"}

 - الاداري المسؤول | ${interaction.user}

  . **`)]
            })
        } else if (interaction.customId.startsWith("accept")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            if (!data.idd || !data.idd.admin) return interaction.reply({
                content: `:x: | تعذر قبول الهوية بسبب عدم تعيين مسؤولين الهويات`,
                ephemeral: true
            })

            if(!interaction.guild.roles.cache.get(data.idd.admin)) return interaction.reply({
                content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`,
                ephemeral: true
            })

            if(!interaction.member.roles.cache.has(data.idd.admin)) return interaction.reply({
                content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر لانك غير مسؤول عن الهويات`,
                ephemeral: true
            })

            if (!data.idd.role) return interaction.reply({
                content: `:x: | تعذر قبول الهوية بسبب عدم تعيين رتبة الهويات`,
                ephemeral: true
            })

            if(!interaction.guild.roles.cache.get(data.idd.role)) return interaction.reply({
                content: `:x: | لا أستطيع ايجاد رتبة الهويات داخل السيرفر`,
                ephemeral: true
            })

            const userId = interaction.customId.split("_")[1]
            const character = interaction.customId.split("_")[2]

            let db = await userBase.findOne({ guild: interaction.guild.id, user: userId })
            db = db[character]

            const row = Discord.ActionRowBuilder.from(interaction.message.components[0]);
            row.components.forEach(button => button.setDisabled(true));

            let iban = `${Math.floor(Math.random()* 1E16)}`
            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                .setDescription(`** تم قبول هويتك 

 - Character  Number | ${character === "c1" ? "1" : "2"}

 - First Name | ${db.id.first}

 - Last Name | ${db.id.last}

 - Birthday | ${db.id.date}

 - GENDER | ${db.id.gender}

 - Birth Place | ${db.id.place}

 - Iban | ${iban}**`);

            let row2 = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/channels/953497803617890314/1271984095194382357")
                    .setLabel("Play"),

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/channels/953497803617890314/1218595811525656707")
                    .setLabel("Rules")
            )

            db.id.accepted = true
            db.id.iban = iban
            await userBase.updateOne({ guild: interaction.guild.id, user: userId },
                {
                    $set: {
                        [`${character}.id`]: db.id
                    }
                }
            );

            interaction.message.edit({
                components: [row]
            })

            let member = interaction.guild.members.cache.get(userId)
            if (!member) return interaction.reply({
                content: `:x: | لا أستطيع ايجاد هذا العضو داخل السيرفر لذلك تعذر إرسال رسالة القبول`
            })

            member.send({
                components: [row2],
                embeds: [embed]
            })

            member.roles.add(data.idd.role)

            await interaction.reply({
                content: `:white_check_mark: | تم قبول الهوية`,
                ephemeral: true
            })

            addPoint(interaction.guild.id, interaction.user.id, "id", 1)

            if(!data.idd.log) return;

            let ch = interaction.guild.channels.cache.get(data.idd.log)
            if(!ch) return;

            ch.send({
                embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - تم قبول هوية | ${member}

 - رقم الشخصية | ${character === "c1" ? "1" : "2"}

 - الاداري المسؤول | ${interaction.user}

  .**`)]
            })
        }
    }
};
