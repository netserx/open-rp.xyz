const userBase = require('../../Models/userBase')
    , guildBase = require('../../Models/guildBase')
    , Discord = require('discord.js')

module.exports = {
    name: `house`,
    aliases: ["1house"],
    run: async (client, message, args) => {
        let db = await guildBase.findOne({ guild: message.guild.id })
        if (!db) {
            db = new guildBase({ guild: message.guild.id })
            await db.save();
        }

        let check = db.joins.find(c => c.user === message.author.id)
        if (!check) return message.reply({
            content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام هذا الامر`
        })

        let data = await userBase.findOne({ guild: message.guild.id, user: message.author.id })
        if (!data) {
            data = new userBase({ guild: message.guild.id, user: message.author.id })
            await data.save();
        }

        data = data[check.character]

        if (data.clamped) return message.reply({
            content: `** - انت مكلبش لايمكنك استخدام هذا الامر**`
        })

        if(data.builds.length <= 0) return message.reply({
            content: `:x: | الشخصية ${check.character === "c1" ? "الاولى" : "الثانية"} لا تملك عقارات`
        })

        let embed = new Discord.EmbedBuilder()
        .setColor("#003d66")
        .setImage("https://i.imgur.com/19vVsy8.png")
        .setTitle(" - Real Estate .")
        .setDescription(`**__Choose your own house from bottom button __**`)

        let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId(`own_builds_menu_${message.author.id}`)
                .setMaxValues(1)
                .setPlaceholder("Select from your own houses")
                .addOptions(data.builds.map((data, i) => { return { emoji: "🏠", label: `${data.name}`, value: `${i}` } }))
        )

        await message.reply({
            embeds: [embed],
            components: [row]
        })
    }
};
