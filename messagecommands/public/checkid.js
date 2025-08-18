const userBase = require('../../Models/userBase'),
      guildBase = require('../../Models/guildBase'),
      Discord = require('discord.js'),
      { createCanvas, loadImage } = require('canvas');

module.exports = {
    name: `checkid`,
    aliases: ["هوية", "idinfo"],
    run: async (client, ctx, args) => {
        const isInteraction = !!ctx.isButton; // true لو جاي من زر
        const guildId = ctx.guild.id;
        const userId = isInteraction ? ctx.user.id : ctx.author.id;

        // جلب بيانات السيرفر
        let db = await guildBase.findOne({ guild: guildId });
        if (!db) {
            db = new guildBase({ guild: guildId });
            await db.save();
        }

        // جلب بيانات المستخدم
        let data = await userBase.findOne({ guild: guildId, user: userId });
        if (!data) {
            return ctx.reply({ content: ":x: | لا توجد هوية مسجلة لك", ephemeral: isInteraction });
        }

        // تجميع الشخصيات المقبولة
        const characters = ["c1", "c2"].filter(c => data[c] && data[c].id && data[c].id.accepted);
        if (characters.length === 0) {
            return ctx.reply({ content: ":x: | لا توجد هوية مقبولة لأي شخصية", ephemeral: isInteraction });
        }

        const charData = data[characters[0]].id;

        // إعداد Canvas
        const width = 600;
        const height = 350;
        const canvas = createCanvas(width, height);
        const ctx2 = canvas.getContext('2d');

        // خلفية
        ctx2.fillStyle = '#003d66';
        ctx2.fillRect(0, 0, width, height);

        // نص العنوان
        ctx2.fillStyle = '#ffffff';
        ctx2.font = 'bold 30px Sans';
        ctx2.fillText('معلومات الهوية', 20, 40);

        // رسم البيانات
        ctx2.font = '20px Sans';
        ctx2.fillText(`Character Number: ${characters[0] === "c1" ? "1" : "2"}`, 20, 80);
        ctx2.fillText(`First Name: ${charData.first}`, 20, 120);
        ctx2.fillText(`Last Name: ${charData.last}`, 20, 160);
        ctx2.fillText(`Birthday: ${charData.date}`, 20, 200);
        ctx2.fillText(`Gender: ${charData.gender}`, 20, 240);
        ctx2.fillText(`Birth Place: ${charData.place}`, 20, 280);
        ctx2.fillText(`IBAN: ${charData.iban || "غير موجود"}`, 20, 320);

        // تحميل صورة المستخدم
        try {
            const user = isInteraction ? ctx.user : ctx.author;
            const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
            const avatar = await loadImage(avatarURL);

            // رسم الصورة بشكل دائري
            const avatarX = 450;
            const avatarY = 50;
            const avatarSize = 100;

            ctx2.save();
            ctx2.beginPath();
            ctx2.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
            ctx2.closePath();
            ctx2.clip();

            ctx2.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            ctx2.restore();
        } catch (err) {
            console.error('خطأ في تحميل صورة المستخدم:', err);
        }

        // تحويل Canvas لملف
        const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: 'identity.png' });

        // إرسال الصورة
        await ctx.reply({ files: [attachment], ephemeral: isInteraction });
    }
};
