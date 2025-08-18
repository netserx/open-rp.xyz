const userBase = require('../../Models/userBase');
const { thefts } = require("../../thefts.json");
const { names } = require("../../config.json");

function getItemKeyFromName(name) {
  if (names[name]) return name;
  const found = Object.entries(names).find(
    ([key, display]) => display.toLowerCase() === name.toLowerCase() || display === name
  );
  if (found) return found[0];
  return name;
}

function matchItem(item, keyName) {
  return (
    (item.itemKey && item.itemKey.toLowerCase() === keyName.toLowerCase()) ||
    (item.name && names[keyName] && item.name.toLowerCase() === names[keyName].toLowerCase())
  );
}

module.exports = {
  name: "سرقة",
  run: async (client, message, args, Discord) => {
    if (!thefts.length) {
      return message.reply({ content: ":x: | لا يوجد أنواع سرقات حالياً." });
    }

    const menu = new Discord.StringSelectMenuBuilder()
      .setCustomId("select_theft_type")
      .setPlaceholder("Make Selection !")
      .addOptions(
        thefts.map(t => ({
          label: t.name,
          value: t.name,
          description: t.desc?.slice(0, 50),
          emoji: t.emoji || "🕵️‍♂️"
        }))
      );

    const row = new Discord.ActionRowBuilder().addComponents(menu);

    const embed = new Discord.EmbedBuilder()
      .setTitle("Heists Mission")
      .setDescription("**From here you can carry out the entire robbery mission, but note that you must carry all the requirements for the robbery that you want to steal**")
      .setImage("https://i.postimg.cc/HWXtDKmQ/IMG-8315.jpg")
      .setColor("#ca1111");

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
