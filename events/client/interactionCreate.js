const Discord = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  run: async (interaction, client) => {
    if (interaction.user.bot) return;

    if (interaction.isCommand()) {
      const cmd = client.slashCommands.get(interaction.commandName);
      if (!cmd || !interaction.channel) return;

      if (cmd.admins && !interaction.member.permissions.has('8')) return interaction.reply({
        content: `**الامر لصلاحية \`ADMINISTRATOR\` فقط .**`, ephemeral: true
      })

      if (cmd.ownership && interaction.user.id !== interaction.guild.ownerId) return interaction.reply({
        content: `**الامر لمالك السيرفر فقط .**`, ephemeral: true
      })

      if (cmd.userPermissions) {
        if (!interaction.member.permissions.has(cmd.userPermissions)) return interaction.reply({
          content: `**الامر لصلاحية \`${cmd.userPermissions}\` فقط .**`
        })
      }

      if (cmd.botPermissions) {
        let botPerms = interaction.channel.permissionsFor(client.user);
        if (!botPerms || !botPerms.has(cmd.botPermissions) || !interaction.guild.me.permissions.has(cmd.botPermissions)) {
          return interaction.reply({ content: `**البوت يحتاج لصلاحية \`${cmd.botPermissions}\` .**` })
        }
      }
      cmd.run(client, interaction, Discord);
    }
  }
}