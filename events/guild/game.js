const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { users: collect } = require("../collecting/collect")
    , { users: make } = require("../collecting/make")
    , { users: upgrade } = require("../collecting/upgrade")
    , { endInterval } = require("./games");

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("game")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            if (!data.games_admin || !data.games_admin) return interaction.reply({
                content: `:x: | تعذر الاختيار بسبب عدم تعيين مسؤولين الاقيام`,
                ephemeral: true
            })

            if (!interaction.guild.roles.cache.get(data.games_admin)) return interaction.reply({
                content: `:x: | لا أستطيع ايجاد رتبة مسؤولين الاقيام داخل السيرفر`,
                ephemeral: true
            })

            if (!interaction.member.roles.cache.has(data.games_admin)) return interaction.reply({
                content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر لانك غير مسؤول عن الاقيام`,
                ephemeral: true
            })

            let choice = interaction.customId.split("_")[1]
            if (choice === "start") {
                if (data.game) return interaction.reply({
                    content: `:x: | الاقيام مفتوحة في الوقت الحالي بالفعل`,
                    ephemeral: true
                })

                if (!data.game_channels) return interaction.reply({
                    content: `:x: | لا يمكنك بدأ القيم بسبب عدم تعين رومات الاقيام`
                })

                const modal = new Discord.ModalBuilder()
                    .setCustomId(`createGame`)
                    .setTitle('Create a new game');

                const hostId = new Discord.TextInputBuilder()
                    .setCustomId('host_id')
                    .setLabel("ايـدي الـهـوسـت")
                    .setStyle("Short");

                const hostHand = new Discord.TextInputBuilder()
                    .setCustomId('host_hand')
                    .setLabel("مـساعـد الـهـوسـت")
                    .setStyle("Short");

                const Time = new Discord.TextInputBuilder()
                    .setCustomId('time')
                    .setLabel("وقـت الـرحـلـة")
                    .setStyle("Short");

                const Warns = new Discord.TextInputBuilder()
                    .setCustomId('warns')
                    .setLabel("تـنـبـيـهـات الـرحـلـة")
                    .setStyle("Short");


                const row1 = new Discord.ActionRowBuilder().addComponents(hostId);
                const row2 = new Discord.ActionRowBuilder().addComponents(hostHand);
                const row3 = new Discord.ActionRowBuilder().addComponents(Time);
                const row4 = new Discord.ActionRowBuilder().addComponents(Warns);

                modal.addComponents(row1, row2, row3, row4);

                await interaction.showModal(modal);
            } else if (choice === "end") {
                if (!data.game) return interaction.reply({
                    content: `:x: | الاقيام مقفلة في الوقت الحالي بالفعل`,
                    ephemeral: true
                })

                if (!data.game_channels) return interaction.reply({
                    content: `:x: | لا يمكنك إنهاء القيم بسبب عدم تعين رومات الاقيام`,
                    ephemeral: true
                })

                let ch = interaction.guild.channels.cache.get(data.game_channels.ads)
                if (!ch) return interaction.reply({
                    content: `:x: | تعذر قفل القيم بسبب عدم إيجاد روم تنبيهات الاقيام داخل هذا السيرفر`,
                    ephemeral: true
                })

                let embedd = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                    .setDescription(`** - اشعار اعصار

 - يوجد اعصار في المدينة يجب على جميع اللاعبين الخروج من الرحلة وانتظار الرحلات القادمة 

رحلة كانت ممتعة ونعوضكم الرحلات القادمة

متمنين لكم التوفيق - **`)

                ch.send({
                    embeds: [embedd],
                    content: `|| @everyone ||`
                })

                data.game = false
                data.joins = []
                data.policejoins = []
                await data.save();

                collect.clear();
                make.clear();
                upgrade.clear();
                endInterval()

                interaction.reply({
                    content: `:white_check_mark: | تم إنهاء القيم بنجاح`,
                    ephemeral: true
                })
            } else if (choice === "renew") {
                if (!data.game) return interaction.reply({
                    content: `:x: | لا يمكنك تجديد الرحلة بسبب أن الاقيام مقفلة في الوقت الحالي`,
                    ephemeral: true
                })

                if (!data.game_channels) return interaction.reply({
                    content: `:x: | لا يمكنك تجديد القيم بسبب عدم تعين رومات الاقيام`,
                    ephemeral: true
                })

                const modal = new Discord.ModalBuilder()
                    .setCustomId(`renewGame`)
                    .setTitle('Renew a game');

                const hostId = new Discord.TextInputBuilder()
                    .setCustomId('host_id')
                    .setLabel("ايـدي الـهـوسـت")
                    .setStyle("Short");


                const row1 = new Discord.ActionRowBuilder().addComponents(hostId);

                modal.addComponents(row1);

                await interaction.showModal(modal);
            } else if (choice === "alert") {
                if (!data.game) return interaction.reply({
                    content: `:x: | لا يمكنك وضع تنبيهات الرحلة بسبب أن الاقيام مقفلة في الوقت الحالي`,
                    ephemeral: true
                })

                if (!data.game_channels) return interaction.reply({
                    content: `:x: | لا يمكنك تنبيه القيم بسبب عدم تعين رومات الاقيام`,
                    ephemeral: true
                })

                const modal = new Discord.ModalBuilder()
                    .setCustomId(`alertGame`)
                    .setTitle('Make alert');

                const ADS = new Discord.TextInputBuilder()
                    .setCustomId('ads')
                    .setLabel("التـنـبـيـهـات")
                    .setStyle("Short");


                const row1 = new Discord.ActionRowBuilder().addComponents(ADS);

                modal.addComponents(row1);

                await interaction.showModal(modal);
            }
        }
    }
};
