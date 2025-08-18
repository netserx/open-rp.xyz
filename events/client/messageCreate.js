const Discord = require('discord.js'), { prefix } = require('../../config')

module.exports = {
  name: "messageCreate",
  run: async (message, client) => {
    if (message.type == 6) return message.delete()

    if (message.author.bot || !message.channel || !message.content.startsWith(prefix)) return;

    let args = message.content.slice(prefix.length).split(/ +/);

    const cmd = args.shift().toLowerCase();

    const command = client.messageCommands.get(cmd);
    if (!command) return;

    if (command.admins && !message.member.permissions.has("8")) return message.reply({
      content: `**الامر لصلاحية \`ADMINISTRATOR\` فقط .**`
    });

    if (command.ownership && message.author.id !== message.guild.ownerId)
      return message.reply({
        content: `**الامر لمالك السيرفر فقط .**`,
        ephemeral: true,
      });

    if (command.userPermissions) {
      if (!message.member.permissions.has(command.userPermissions)) return message.reply({
        content: `**الامر لصلاحية \`${cmd.userPermissions}\` فقط .**`,
      });
    }

    if (command.botPermissions) {
      let botPerms = message.channel.permissionsFor(client.user);
      if (
        !botPerms ||
        !botPerms.has(command.botPermissions) ||
        !message.guild.me.permissions.has(command.botPermissions)
      ) {
        return message.reply({
          content: `**البوت يحتاج لصلاحية \`${cmd.botPermissions}\``,
        });
      }
    }

    command.run(client, message, args, Discord);
  },
};
