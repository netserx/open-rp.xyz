const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , cooldowns = new Map();

    const items = [
        { name: "Teser", count: 2 },
        { name: "Heavy Armor", count: 10 },
        { name: "Radio", count: 2 },
        { name: "Knife", count: 2 },
        { name: "Diving Kit", count: 1 },
        { name: "Parachute", count: 2 },
        { name: "Diverter", count: 25 },
        { name: "Light", count: 1 },
    ]

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("take_items")) {
            let data = await guildBase.findOne({ guild: interaction.guild.id })
            if (!data) {
                data = new guildBase({ guild: interaction.guild.id })
                await data.save();
            }

            if (!data.police_admin) return interaction.reply({
                content: `:x: | تعذر الاستلام بسبب عدم تعيين مسؤولين العساكر`,
                ephemeral: true
            })

            if (!interaction.guild.roles.cache.get(data.police_admin)) return interaction.reply({
                content: `:x: | تعذر الاستلام بسبب عدم إيجاد رتبة مسؤولين العساكر داخل السيرفر`,
                ephemeral: true
            })

            if (!interaction.member.roles.cache.has(data.police_admin)) return interaction.reply({
                content: `:x: | لا يمكنك استخدام هذا الزر لانك غير مسؤول`,
                ephemeral: true
            })

            let check = data.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك حتى تتمكن من الاستلام`,
                ephemeral: true
            })

            const now = Date.now();
            const cooldownAmount = 5 * 24 * 60 * 60 * 1000;
    
            if (cooldowns.has(interaction.user.id)) {
                const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;
    
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / (1000 * 60 * 60 * 24);
                    return interaction.reply({
                        content: `:x: | يجب عليك أنتظار ${timeLeft.toFixed(1)} ايام حتى تتمكن من الاستلام`,
                        ephemeral: true
                    })
                }
            }

            let db = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            if(!db) {
                db = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                await db.save();
            }
            db = db[check.character]

            items.forEach(item => {
                let index = db.inv.findIndex(c => c.name.toLowerCase() === item.name.toLowerCase())
                index === -1 ? db.inv.push(item) : db.inv[index].count += item.count
            })

            await userBase.updateOne({ guild: interaction.guild.id, user: interaction.user.id },
                {
                    $set: {
                        [`${check.character}`]: db
                    }
                }
            );

            interaction.reply({
                ephemeral: true,
                content: `** - Items successfully claimed, next claim after 5 days.**`
            })
    
            cooldowns.set(interaction.user.id, now);
    
            setTimeout(() => cooldowns.delete(interaction.user.id), cooldownAmount);

            if(!data.police_log) return;
            let log = interaction.guild.channels.cache.get(data.police_log)
            if(!log) return;

            log.send({
                embeds: [
                    new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**Police Log 

 - الشخص | ${interaction.user}

- نوع الستورج | 1

 - الشخصية | ${check.character === "c1" ? "1" : "2"}

\`\`   \`\`**`)
                ]
            })
        }
    }
};