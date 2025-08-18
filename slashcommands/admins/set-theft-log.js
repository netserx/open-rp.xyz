const guildBase = require('../../Models/guildBase');

module.exports = {
  name: 'set-theft-log',
  description: 'تعيين قناة السرقات والرتبة التي يتم منشنها',
  default_member_permissions: '0x0000000000000008', // Manage Guild
  options: [
    {
      name: 'القناة',
      description: 'القناة التي يتم إرسال تفاصيل السرقة فيها',
      type: 7, // CHANNEL
      required: true
    },
    {
      name: 'الرتبة',
      description: 'الرتبة التي سيتم منشنها عند حدوث السرقة',
      type: 8, // ROLE
      required: true
    }
  ],

  run: async (client, interaction, Discord) => {
    const channel = interaction.options.getChannel('القناة');
    const role = interaction.options.getRole('الرتبة');

    if (!channel || !role) {
      return interaction.reply({ content: ':x: | تأكد من إدخال القناة والرتبة بشكل صحيح.', ephemeral: true });
    }

    let data = await guildBase.findOne({ guild: interaction.guild.id });
    if (!data) data = new guildBase({ guild: interaction.guild.id });

    data.theftLogChannel = channel.id;
    data.theftMentionRole = role.id;
    await data.save();

    return interaction.reply({
      content: `✅ | تم تعيين قناة السرقة إلى ${channel}، والمنشن للرتبة ${role}`,
      ephemeral: true
    });
  }
};
