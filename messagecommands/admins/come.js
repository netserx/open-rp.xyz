const Discord = require("discord.js")
const userBase = require("../../Models/userBase")
const guildBase = require("../../Models/guildBase")

module.exports = {
    name: `استدعاء`,
    run: async (client, message, args) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.comes || !data.comes.admin) return message.reply({
            content: `:x: | تعذر الاستدعاء بسبب عدم تعيين مسؤولين الاستدعاءات`
        })

        if (!message.guild.roles.cache.get(data.comes.admin)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.comes.admin)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر لانك غير مسؤول عن الاستدعاءات`
        })

        if (!data.comes.channel) return message.reply({
            content: `:x: | تعذر الاستدعاء بسبب عدم تعيين روم الاستدعاءات`
        })

        if (!message.guild.channels.cache.get(data.comes.channel)) return message.reply({
            content: `:x: | لا أستطيع ايجاد روم الاستدعاءات داخل السيرفر`
        })

        if (data.comes.all.length <= 0) return message.reply({
            content: `:x: | تعذر الاستدعاء بسبب عدم تعيين نوع الاستدعاءات`
        })

        let user = message.mentions.users.first();
        if (!user) return message.reply({
            content: `:x: | يجب عليك منشن الشخص الذي تريد استدعاءه`
        })

        if (user.bot || user.id === message.author.id) return message.reply({
            content: `:x: | لا يمكنك استدعاء هذا العضو`
        })

        let row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId(`types_comes`)
                    .setPlaceholder('Make Selection !')
                    .setMaxValues(1)
                    .addOptions(data.comes.all.map(type => ({ label: `${type}`, value: `${type}` })))
            );

        let msg = await message.reply({ components: [row] })
        const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.StringSelectMenuBuilder, time: 20000 });
        collector.on('collect', async i => {
            if (i.user.id != message.author.id) return i.reply({
                content: `**:x: | ليس لديك صلاحيات لاستخدام هذا الاختيار**`,
                ephemeral: true
            })

            if (i.customId.startsWith("types_comes")) {
                let value = i.values[0]

                let index = data.comes.all.findIndex(c => c.toLowerCase() == value.toLowerCase())
                if (index === -1) return msg.edit({ 
                    components: [],
                    content: `**:x: | لا أستطيع ايجاد هذا النوع من الاستدعاءات ، ربما تم حذفه**`
                })

                let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setDescription(`** -   .

 - عزيزي العضو | ${user}
تم استدعائك من قبل الادارة لمخالفتك احد الانظمة 
 - نوع المخالفة | ${value}
يرجى الضغط على الزر في الاسفل لنقلك روم الانتظار

 - ملاحظة هامة |
يجب ارفاق تصوير مدته 30 دقيقة لتجنب المخالفة
يجب قراءة قوانين الاستدعاء ( <#1268548844329766913> )

في حال عدم حضورك لمدة 15 دقيقة سيتم محاسبتك

متمنين لك التوفيق ->**`)
                

                let row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL("https://discord.gg/85pPG8EcuE")
                        .setLabel("Join")
                )

                let row2 = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setLabel("إنهاء الاستدعاء")
                        .setCustomId(`endCome_${message.author.id}_${user.id}_${value}`)
                )

                user.send({
                    embeds: [embed],
                    components: [row]
                }).then(async () => {
                    i.deferUpdate();

                    await msg.edit({
                        embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`:white_check_mark: | تم إستدعاء العضو ${user} بنجاح`)],
                        components: [row2]
                    })

                    let chch = message.guild.channels.cache.get(data.comes.channel)
                    if(chch) {
                        chch.send({
                            embeds: [embed]
                        })
                    }

                    let ch = message.guild.channels.cache.get(data.comes.log)
                    if(!ch) return;

                    let embed2 = new Discord.EmbedBuilder()
                    .setColor("#003d66")
                    .setDescription(`** - تم استدعاء العضو | ${user}

 - من قبل الاداري | ${message.author}

 - نوع الاستدعاء | ${i.values[0]}**`)

                    ch.send({
                        embeds: [embed2]
                    })
                }).catch(() => {
                    return msg.edit({
                        content: `:x: | لن اتمكن من استدعاء العضو ${user}`,
                        components: []
                    })
                })
            }
        })
    }
};
