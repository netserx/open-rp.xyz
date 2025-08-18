const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { ticket_roles, ticketLog } = require("../../config.json")
    , { addPoint } = require("../../functions.js")

module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("bank")) {
            let value = interaction.customId.split("_")[1]

            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام البنك`,
                ephemeral: true
            })

            let data = await userBase.findOne({ guild: interaction.guild.id, user: interaction.user.id })
            if (!data) {
                data = new userBase({ guild: interaction.guild.id, user: interaction.user.id })
                await data.save();
            }

            data = data[check.character]
            if (data.clamped) return interaction.reply({
                ephemeral: true,
                content: `** - انت مكلبش لايمكنك استخدام البنك**`
            })

            if (value === "show") {
                return interaction.reply({
                    embeds: [new Discord.EmbedBuilder().setColor("#003d66").setDescription(`**  - Character Number | ${check.character === "c1" ? "1" : "2"}

 - Cash | ${data.cash}

 - Bank | ${data.bank}

 - Total | ${data.cash + data.bank}

 - Iban | ${data.id.iban ? data.id.iban : "لا يوجد"}

  - Maze Central Bank .**`)],
                    ephemeral: true
                })
            } else if (value === "add") {
                const modal = new Discord.ModalBuilder()
                    .setCustomId(`addMoney`)
                    .setTitle('Transfer money from cash to bank');

                const money = new Discord.TextInputBuilder()
                    .setCustomId('money')
                    .setLabel("المبلغ الذي تريد إيداعه")
                    .setStyle("Short");

                const row1 = new Discord.ActionRowBuilder().addComponents(money);

                modal.addComponents(row1);

                await interaction.showModal(modal);
            } else if (value === "get") {
                const modal = new Discord.ModalBuilder()
                    .setCustomId(`getMoney`)
                    .setTitle('Transfer money from bank to cash');

                const money = new Discord.TextInputBuilder()
                    .setCustomId('money')
                    .setLabel("المبلغ الذي تريد سحبه")
                    .setStyle("Short");

                const row1 = new Discord.ActionRowBuilder().addComponents(money);

                modal.addComponents(row1);

                await interaction.showModal(modal);
            } else if (value === "trans") {
                const modal = new Discord.ModalBuilder()
                    .setCustomId(`transferMoney`)
                    .setTitle('Transfer money to another');

                const IBAN = new Discord.TextInputBuilder()
                    .setCustomId('iban')
                    .setLabel("رقم الايبان الذي تريد التحويل عليه")
                    .setStyle("Short");

                const idName = new Discord.TextInputBuilder()
                    .setCustomId('idName')
                    .setLabel("أسم الهوية الذي تريد التحويل لها")
                    .setStyle("Short");

                const money = new Discord.TextInputBuilder()
                    .setCustomId('money')
                    .setLabel("المبلغ الذي تريد تحويله")
                    .setStyle("Short");

                const row1 = new Discord.ActionRowBuilder().addComponents(IBAN);
                const row2 = new Discord.ActionRowBuilder().addComponents(idName);
                const row3 = new Discord.ActionRowBuilder().addComponents(money);

                modal.addComponents(row1, row2, row3);

                await interaction.showModal(modal);
            }
        }
    }
};
