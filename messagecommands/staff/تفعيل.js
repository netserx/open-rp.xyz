const userBase = require('../../Models/userBase')
const guildBase = require('../../Models/guildBase')
    , { addPoint } = require("../../functions")
module.exports = {
    name: `تفعيل`,
    run: async (client, message, args, Discord) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.staff_role) return message.reply({
            content: `:x: | تعذر التفعيل بسبب عدم تعيين رتبة الادارة`
        })

        if (!message.guild.roles.cache.get(data.staff_role)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة الادارة داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.staff_role)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الامر لانك لست اداري`
        })

        if (!data.tf3el) return message.reply({
            content: `:x: | تعذر التفعيل بسبب عدم تعيين رتب التفعيل`
        })

        if (data.tf3el.add.length <= 0 || data.tf3el.remove.length <= 0) return message.reply({
            content: `:x: | تعذر التفعيل بسبب عدم تعيين رتب ${data.tf3el.add.length <= 0 ? "الاضافة" : "الحذف"} للتفعيل`
        })

        let user = message.mentions.members.first()
        if (!user) return message.reply({
            content: `:x: | يجب عليك منشن الشخص الذي تريد تفعيله`
        })
        if (user.user.id === message.author.id || user.user.bot) return message.reply({
            content: `:x: | لا يمكنك تفعيل هذا الشخص`
        })

        const check = data.tf3el.add.every(roleId => user.roles.cache.has(roleId));
        if (check) return message.reply({
            content: `:x: | تم تفعيل هذا العضو من قبل`
        })

        let id = message.content.split(" ").slice(2).join(" ")
        if (!id) return message.reply({
            content: `:x: | يجب عليك ذكر الايدي العضو الذي تريد تعينه`
        })

        let done = [], error = [], changed = false, sent = false
        for (let r of data.tf3el.add) {
            let role = message.guild.roles.cache.get(r)
            if (!role) {
                error.push(r)
                continue
            }
            await user.roles.add(role).then(() => done.push(r)).catch(() => error.push(r))
        }

        for (let r of data.tf3el.remove) {
            let role = message.guild.roles.cache.get(r)
            if (!role) {
                error.push(r)
                continue
            }

            await user.roles.remove(role).then(() => done.push(r)).catch(() => error.push(r))
        }

        await user.setNickname(`${id}`).then(() => changed = true).catch(() => changed = false)

        await user.send({
            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  .

 - عزيزي اللاعب | ${user}

 - تم تفعيلك من قبل الأداري | ${message.author}

 - يرجى قراءة القوانين وإنشاء هويتك من خلال الضغط على الزر في الاسفل

متمنين لك التوفيق - >**`)],

            components: [new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/channels/953497803617890314/1218595811525656707")
                    .setLabel("Rules"),

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/channels/953497803617890314/1218051511808954378")
                    .setLabel("Create Character")
            )]
        }).then(() => sent = true).catch(() => sent = false)

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setThumbnail(message.guild.iconURL())
            .setTimestamp()
            .setDescription(`** <:BR8:1372832911543500901> -   . 

 - تم تفعيل العضو | ${user} بنجاح 

 - من قبل الإداري | ${message.author}

 - تم اضافة 3 نقاط إدارية لك 

متمنين لك التوفيق - >**`)

        await message.reply({
            embeds: [embed]
        })

        addPoint(message.guild.id, message.author.id, "tf3el", 3)

        let ch = message.guild.channels.cache.get(data.tf3el.log)
        if (!ch) return;

        ch.send({
            embeds: [new Discord.EmbedBuilder().setColor("#003d66").setTimestamp().setThumbnail(message.guild.iconURL())
             .setDescription(`** - سجل التفعيل

 - تم تفعيل العضو | ${user}

 - الأداري المسؤول | ${message.author}

${done.length < data.tf3el.add.length && done.length < data.tf3el.remove.length ? " - فشل تغيير رتب العضو" : " - تم تغيير رتب العضو بنجاح"}

${changed ? " - تم تغيير اسم العضو بنجاح" : " - فشل  تغيير اسم العضو"}

${sent ? " - نجح ارسال الرسالة للعضو في الخاص" : " - فشل ارسال الرسالة في الخاص "}

 -  **`)]
        })
    }
};