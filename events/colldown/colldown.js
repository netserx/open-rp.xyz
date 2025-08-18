// داخل أمر البوت أو حدث معين
const { togglePriority } = require('../../functions');

async function handlePriorityCommand(message, character) {
  const newPriority = await togglePriority(message.guild, message.author, character);
  message.channel.send(`تم تغيير الأولوية للشخصية **${character}** إلى: ${newPriority ? "مفعلة" : "معطلة"}`);
}
