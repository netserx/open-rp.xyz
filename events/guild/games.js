const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , { addPoint, checkCount } = require("../../functions");

let interval;
module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId.startsWith("createGame")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            let ch = interaction.guild.channels.cache.get(data.game_channels.start_game)
            if (!ch) return interaction.reply({
                content: `:x: | تعذر فتح القيم بسبب عدم إيجاد روم فتح الاقيام داخل هذا السيرفر`,
                ephemeral: true
            })

            const hostId = interaction.fields.getTextInputValue('host_id')
                , hostHand = interaction.fields.getTextInputValue('host_hand')
                , Time = interaction.fields.getTextInputValue('time')
                , Warns = interaction.fields.getTextInputValue('warns');

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/channels/953497803617890314/1218595811525656707")
                    .setLabel("Rules"),

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/channels/953497803617890314/1218595899165638816")
                    .setLabel("Join Server")
            )

            let embedd = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                .setDescription(`** - اشـعـار فـتـح رحـلـة 

 - ايـدي الـهـوسـت | ${hostId}

 - مـساعـد الـهـوسـت | ${hostHand}

 - وقـت الـرحـلـة | ${Time}

 - تـنـبـيـهـات الـرحـلـة | ${Warns}

 - الـرجـاء اتـبـاع الـتـعـلـيـمـات الـتـالـيـة :

- يـجـب قـراءة الـقـوانـيـن بـشـكـل جـيـد لـتـجنـب الـمـخـالـفـات .

- تـأكـد مـن ارسـال طـلـب صـداقـة لـلـهـوسـت .

 - الرجـاء الـضـغـط عـلـى الـزريـن فـي الأسـفـل لـنـقـلـك لـقـوانـيـن .**`)

            ch.send({
                embeds: [embedd],
                content: `|| @everyone ||`,
                components: [row]
            }).then(async msg => {
                await msg.react("🌐") //رياكت تصويت الجيم
            })

            data.game = true
            await data.save();

            require("./games.js").startInterval(interaction.guild);

            let eem = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** - تم فتح القيم بنجاح و إضافة 5 نقاط إدارية لك**`)

            interaction.reply({
                embeds: [eem],
                ephemeral: true
            })

            addPoint(interaction.guild.id, interaction.user.id, "start_game", 5)
        } else if (interaction.customId.startsWith("renewGame")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            let ch = interaction.guild.channels.cache.get(data.game_channels.ads)
            if (!ch) return interaction.reply({
                content: `:x: | تعذر تجديد القيم بسبب عدم إيجاد روم تنبيهات الاقيام داخل هذا السيرفر`,
                ephemeral: true
            })

            const hostId = interaction.fields.getTextInputValue('host_id')

            let embedd = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                .setDescription(`** - اشعار تجديد 

 - يوجد تجديد رحلة 
الرجاء من الجميع وضع خيار ( Last Location ) والخروج من الرحلة ودخول على الرحلة الجديدة 
 - ايدي الهوست | ${hostId}

متمنين لكم التوفيق - **`)

            ch.send({
                embeds: [embedd],
                content: `|| @everyone ||`
            })

            interaction.reply({
                content: `:white_check_mark: | تم تجديد القيم بنجاح`,
                ephemeral: true
            })
        } else if (interaction.customId.startsWith("alertGame")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            let ch = interaction.guild.channels.cache.get(data.game_channels.ads)
            if (!ch) return interaction.reply({
                content: `:x: | تعذر وضع تنبيهات للقيم بسبب عدم إيجاد روم تنبيهات الاقيام داخل هذا السيرفر`,
                ephemeral: true
            })

            const ADS = interaction.fields.getTextInputValue('ads')

            let embedd = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage("https://i.imgur.com/LGcsHp8.jpeg")
                .setDescription(`** - اشعار تنبيه اداري 

 - التنبية | ${ADS}

متمنين لكم التوفيق - **`)

            ch.send({
                embeds: [embedd],
                content: `|| @everyone ||`
            })

            interaction.reply({
                content: `:white_check_mark: | تم تجديد القيم بنجاح`,
                ephemeral: true
            })
        }
    },

    startInterval: (guild) => {
        interval = setInterval(() => {
            checkCount(guild);
        }, 2700000);
    },

    endInterval: () => {
        if (interval) {
            clearInterval(interval);
        }
    }
};
