const UserBase = require("../../Models/userBase");

module.exports = {
    name: "بياناتي",
    description: "عرض كل بياناتك من قاعدة البيانات",
    async execute(message) {
        try {
            const userData = await UserBase.findOne({
                guild: message.guild.id,
                user: message.author.id
            });

            if (!userData) {
                return message.reply("❌ ما لقيتش بياناتك في قاعدة البيانات.");
            }

            message.reply({
                embeds: [
                    {
                        title: "📄 بياناتك",
                        description: "```json\n" + JSON.stringify(userData.toObject(), null, 2) + "\n```",
                        color: 0x00ff99
                    }
                ]
            });

        } catch (error) {
            console.error(error);
            message.reply("⚠ حصل خطأ أثناء جلب البيانات.");
        }
    }
};
