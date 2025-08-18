const Discord = require("discord.js")
const userBase = require("../../Models/userBase")
const guildBase = require("../../Models/guildBase")

module.exports = {
    name: `reset-money-all`,
    run: async (client, message, args) => {
        let data = await guildBase.findOne({ guild: message.guild.id })
        if (!data) {
            data = new guildBase({ guild: message.guild.id })
            await data.save();
        }

        if (!data.bank_admin) return message.reply({
            content: `:x: | تعذر الاستخدام بسبب عدم تعيين مسؤولين البنك`
        })

        if (!message.guild.roles.cache.get(data.bank_admin)) return message.reply({
            content: `:x: | لا أستطيع ايجاد رتبة المسؤولين داخل السيرفر`
        })

        if (!message.member.roles.cache.has(data.bank_admin)) return message.reply({
            content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر لانك غير مسؤول عن البنك`
        })

        let character = args[0], only = ["1", "2"]
        if (!character || !only.includes(character)) return message.reply({
            content: `:x: | يجب عليك تحديد الشخصية الذي تريد تصفير اموالها 1 / 2`
        })

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(`reset_all_confirm`)
                .setLabel("تأكيد")
                .setStyle("Success"),

            new Discord.ButtonBuilder()
                .setCustomId(`cancel`)
                .setLabel("إلغاء")
                .setStyle("Danger")
        )

        let embed = new Discord.EmbedBuilder()
            .setColor("#003d66")
            .setDescription(`> **هل أنت متأكد أنك تريد تصفير جميع رصيد بنكي للشخصية ${character === "1" ? "الاولى" : "الثانية"}**`)

        let msg = await message.reply({
            embeds: [embed],
            components: [row]
        })

        const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 20000 })
        collector.on('collect', async i => {
            if (i.user.id != message.author.id) return i.reply({
                content: `:x: | ليس لديك صلاحيات لاستخدام هذا الزر`,
                ephemeral: true
            })

            if (i.customId === "reset_all_confirm") {
                let db = await userBase.find({ guild: message.guild.id })
                db.forEach(async dbb => {
                    await userBase.updateOne({ guild: message.guild.id, user: dbb.user },
                        {
                            $set: { [`${character === "1" ? "c1" : "c2"}.bank`]: 0 }
                        }
                    );
                })

                await msg.edit({
                    components: [],
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`:white_check_mark: | تم تصفير الشخصية ${character === "1" ? "الاولى" : "الثانية"} من الكل بنجاح`)]
                })

                let log = message.guild.channels.cache.get(data.bank_log)
                if (!log) return;
        
                log.send({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`** - Remove All Money By | ${message.author}
        
         - Character Number | ${character}
        
         -   .**`)]
                })
            } else if (i.customId === "cancel") {
                i.deferUpdate();

                await msg.edit({
                    content: `:white_check_mark: | تم إلغاء عملية التصفير`,
                    components: [],
                    embeds: []
                })
            }
        });

        collector.on('end', collect => {
            if(collect.first()) return;
            
            msg.edit({ content: "أنتهى الوقت", embeds: [], components: [] })
        });
    }
};
