const guildBase = require('../../Models/guildBase');

module.exports = {
  name: 'set-verification-role',
  description: 'تعيين رتبة التوثيق التلقائي',
  default_member_permissions: '0x0000000000000008', // Manage Guild
  options: [
    {
      name: 'الرتبة',
      description: 'الرتبة التي إذا كان صاحب البلاغ يملكها يُعتبر موثقًا تلقائيًا',
      type: 8, // ROLE
      required: true
    }
  ],
  run: async (client, interaction, Discord) => {
    if (!interaction.isChatInputCommand && !interaction.commandName) {
      // قد يكون عندك handler مختلف، لكن نضمن إننا في الكوماند
    }

    const role = interaction.options.getRole('الرتبة');
    if (!role) {
      return interaction.reply({ content: ':x: | ما لقيتش الرتبة.', ephemeral: true });
    }

    let db = await guildBase.findOne({ guild: interaction.guild.id });
    if (!db) {
      db = new guildBase({ guild: interaction.guild.id });
    }

    db.verificationRole = role.id;
    await db.save();

    await interaction.reply({
      content: `:white_check_mark: | تم تعيين رتبة التوثيق التلقائي إلى <@&${role.id}>`,
      ephemeral: true
    });
  }
};
