const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

module.exports = {
  name: "send-message4",
  run: async (client, message, args) => {
    // التحقق إذا كان المستخدم لديه صلاحية الأدمن
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // إنشاء الإمبيد (الرسالة المضمنة)
    const embed = new EmbedBuilder()
      .setColor("#003d66")
      .setImage("https://i.imgur.com/p9eySvl.png")
      .setDescription("**<:BR8:1372832911543500901> - اختر الخدمة المطلوبة.**");

    // إنشاء الأزرار في صف واحد
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("bank_show")
        .setLabel("Money")
        .setEmoji("💰")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("bank_trans")
        .setLabel("Transfer")
        .setEmoji("🏦")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("bank_add")
        .setLabel("Dep")
        .setEmoji("💵")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("bank_get")
        .setLabel("With")
        .setEmoji("💳")
        .setStyle(ButtonStyle.Success)
    );

    // حذف الرسالة الأصلية
    await message.delete();

    // إرسال الإمبيد مع الأزرار
    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
