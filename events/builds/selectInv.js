const Discord = require('discord.js')
    , guildBase = require('../../Models/guildBase')
    , userBase = require('../../Models/userBase')
    , { builds } = require('../../builds.json')
    , items = new Map()
module.exports = {
    name: `interactionCreate`,
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

        if (interaction.customId.startsWith("selectInv")) {
            var values = interaction.values

            await interaction.update({
                components: interaction.message.components.map(row => {
                    return new Discord.ActionRowBuilder().addComponents(
                        row.components.map(component => {
                            if (component.type === Discord.ComponentType.StringSelect) {
                                const updatedOptions = component.options.filter(option => 
                                    !interaction.values.includes(option.value)
                                );
            
                                if (updatedOptions.length === 0) return null;
            
                                return new Discord.StringSelectMenuBuilder()
                                    .setCustomId(component.customId)
                                    .setMaxValues(updatedOptions.length)
                                    .setPlaceholder(component.placeholder)
                                    .addOptions(updatedOptions);
                            }
                            return component;
                        }).filter(c => c !== null)
                    );
                }).filter(row => row.components.length > 0)
            });

            const checkItems = items.get(interaction.user.id)
            if(checkItems) {
                checkItems.push(...values)
                values = checkItems
            }
        
            await items.set(interaction.user.id, values)
        } else if (interaction.customId.startsWith("actionHouseSuccess")) {
            let data = items.get(interaction.user.id)
            if(!data || data.length <= 0) return interaction.reply({
                ephemeral: true,
                content: `:x: | يجب عليك تعيين الاغراض التي تريد تخزينها قبل إجراء عملية الحفظ`
            })

            await interaction.reply({
                content: `:white_check_mark: | اخترت ${data.map(c => c).join("\n")}`
            })
        }
/*
            let db = await guildBase.findOne({ guild: interaction.guild.id })
            if (!db) {
                db = new guildBase({ guild: interaction.guild.id })
                await db.save();
            }

            let check = db.joins.find(c => c.user === interaction.user.id)
            if (!check) return interaction.reply({
                content: `:x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام المتجر`,
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
                content: `**<:gulfbot_1134085602233569350:1268201574430412850> - انت مكلبش لايمكنك التعديل عقار**`
            })

            let row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`houseActions_cars_${value}_${interaction.user.id}`)
                    .setStyle("Secondary")
                    .setLabel("House Carage"),

                new Discord.ButtonBuilder()
                    .setCustomId(`houseActions_add_${value}_${interaction.user.id}`)
                    .setStyle("Secondary")
                    .setLabel("Add Safe"),

                new Discord.ButtonBuilder()
                    .setCustomId(`houseActions_take_${value}_${interaction.user.id}`)
                    .setStyle("Secondary")
                    .setLabel("Take Safe")
            )

            const build = data.builds[value]

            let embed = new Discord.EmbedBuilder()
                .setColor("#003d66")
                .setImage(`${build.image}`)
                .setDescription(`**<:1156686783245983765:1219887222724231239> — Apartment Name ( ${build.name} )
🚗 - Garage ( ${build.garage} )
📦 - Storage space ( ${build.storage} )
<:mapgc4:1222453427624480838> - Apartment Location ( ${build.location} )
<:1209865803277664286:1221268099878359100> - Apartment Price ( ${build.price.toLocaleString("en-US")} ) **`)

            await interaction.update({
                embeds: [embed],
                ephemeral: true,
                components: [row]
            })*/
    }
};
