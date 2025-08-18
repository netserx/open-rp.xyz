const Discord = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const guildBase = require('../../Models/guildBase');
const userVerification = require('../../Models/userVerification');
const { v4: uuidv4 } = require('uuid'); // لتوليد معرف فريد للتقرير

let fontFamily = 'Cairo';
try {
    registerFont(path.join(__dirname, '../fonts/Cairo-Regular.ttf'), { family: 'Cairo' });
} catch {
    console.warn('⚠️ لم يتم العثور على فونت Cairo، سيتم استخدام الخط الافتراضي.');
    fontFamily = 'sans-serif';
}

async function renderPost({ displayName, username, content, avatarURL, extraImageURL = null, verified = false }) {
    const scale = 2;
    const baseWidth = 800;
    const padding = 70 * scale;
    const avatarSize = 120 * scale;
    const lineHeight = 48 * scale;

    const canvas = createCanvas(baseWidth * scale, 2000 * scale);
    const ctx = canvas.getContext('2d');

    // خلفية
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // تحميل أفاتار
    let avatarImg = null;
    try {
        avatarImg = await loadImage(avatarURL);
    } catch {}

    const avatarX = canvas.width - padding - avatarSize;
    const avatarY = padding;

    if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
    }

    // إعداد نص RTL
    ctx.direction = 'rtl';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';

    // إحداثيات الاسم
    let nameStartX = avatarX - 20 * scale;
    const nameY = avatarY;

    // إذا موثق: ارسم الشارة بين الأفاتار والاسم وعدّل موضع الاسم
    if (verified) {
        const badgeSize = 30 * scale;
        const badgeX = avatarX - badgeSize - 10 * scale;
        const badgeY = avatarY + (avatarSize / 2) - (badgeSize / 2) - (31 * scale);
        // دائرة زرقاء مع علامة ✓ (بدون صورة)
        ctx.fillStyle = '#1DA1F2';
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `${24 * scale}px "${fontFamily}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', badgeX + badgeSize / 2, badgeY + badgeSize / 2);
        // استرجاع محاذاة
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        nameStartX = badgeX - 10 * scale;
    }

    // رسم الاسم
    ctx.font = `${39 * scale}px "${fontFamily}"`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(displayName, nameStartX, nameY);
    const displayWidth = ctx.measureText(displayName).width;

    // رسم اليوزرنيم تحته
    ctx.font = `${31 * scale}px "${fontFamily}"`;
    ctx.fillStyle = '#8899a6';
    ctx.fillText(`@${username}`, nameStartX - displayWidth - 10 * scale, nameY + 6 * scale);

    // المحتوى
    let y = nameY + (39 * scale) + (35 * scale);
    ctx.font = `${34 * scale}px "${fontFamily}"`;
    ctx.fillStyle = '#ffffff';
    const textRightX = nameStartX;
    const maxTextWidth = textRightX - padding;

    const words = content.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        if (ctx.measureText(testLine).width > maxTextWidth) {
            ctx.fillText(line, textRightX, y);
            line = words[i];
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line) {
        ctx.fillText(line, textRightX, y);
        y += lineHeight;
    }

    if (extraImageURL) {
        try {
            const extraImage = await loadImage(extraImageURL);
            let imgWidth = maxTextWidth;
            let imgHeight = (extraImage.height / extraImage.width) * imgWidth;
            y += 20 * scale;
            const imgX = textRightX - imgWidth;
            ctx.drawImage(extraImage, imgX, y, imgWidth, imgHeight);
            y += imgHeight;
        } catch {}
    }

    // تقليل الحجم النهائي
    const finalHeight = Math.ceil(y + padding);
    const outputCanvas = createCanvas(baseWidth * scale, finalHeight);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.drawImage(canvas, 0, 0, baseWidth * scale, finalHeight, 0, 0, baseWidth * scale, finalHeight);

    const finalCanvas = createCanvas(baseWidth, finalHeight / scale);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(outputCanvas, 0, 0, baseWidth, finalHeight / scale);

    return finalCanvas.toBuffer();
}

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        // أولاً: معالجة ضغطة زر القلب عامة
        if (interaction.isButton() && interaction.customId.startsWith('heart_')) {
            const parts = interaction.customId.split('_'); // heart_{reportId}
            const reportId = parts[1];
            if (!reportId) return;

            // نبحث عن التقرير داخل userVerification
            const authorDoc = await userVerification.findOne({ 'reports.id': reportId });
            if (!authorDoc) {
                await interaction.reply({ content: 'هذا التقرير غير موجود أو منتهي.', flags: 64 });
                return;
            }

            // نجيب التقرير نفسه
            const report = authorDoc.reports.find(r => r.id === reportId);
            if (!report) {
                await interaction.reply({ content: 'خطأ داخلي في التقرير.', flags: 64 });
                return;
            }

            // منع صاحب المنشور يضغط قلب لنفسه
            if (interaction.user.id === authorDoc.userId) {
                await interaction.reply({ content: 'لا يمكنك الاعجاب على منشورك', flags: 64 });
                return;
            }

            // toggle
            if (!Array.isArray(report.heartsFrom)) report.heartsFrom = [];
            let replyText;
            if (!report.heartsFrom.includes(interaction.user.id)) {
                report.heartsFrom.push(interaction.user.id);
                replyText = `${interaction.user} تم اضافة اعجاب للمنشور`;
            } else {
                report.heartsFrom = report.heartsFrom.filter(id => id !== interaction.user.id);
                replyText = `${interaction.user} لقد تم الغاء الاعجاب`;
            }

            // نحفظ التغيير
            await authorDoc.save();

            // تحديث الزر في الرسالة الأصلية
            try {
                const channel = await client.channels.fetch(report.channelId);
                const message = await channel.messages.fetch(report.messageId);
                const newButton = new Discord.ButtonBuilder()
                    .setCustomId(`heart_${report.id}`)
                    .setLabel(`❤️ ${Array.isArray(report.heartsFrom) ? report.heartsFrom.length : 0}`)
                    .setStyle(Discord.ButtonStyle.Danger);
                const newRow = new Discord.ActionRowBuilder().addComponents(newButton);
                await message.edit({ components: [newRow] });
            } catch (err) {
                console.warn('يوجد مشكلة الان', err);
            }

            await interaction.reply({ content: replyText, flags: 64 });
            return;
        }

        // معالجة المودال
        if (!interaction.isModalSubmit()) return;
        if (!interaction.customId.startsWith('reportGmc')) return;

        await interaction.deferReply({ flags: 64 });

        const reportData = interaction.fields.getTextInputValue('report_data') || '';
        const imageLink = interaction.fields.getTextInputValue('report_image') || null;

        const user = interaction.user;
        const displayName = interaction.member?.displayName || user.username;
        const username = user.username;
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 });

        let userDoc = await userVerification.findOne({ userId: user.id });
        if (!userDoc) userDoc = await userVerification.create({ userId: user.id });

        const data = await guildBase.findOne({ guild: interaction.guild.id });
        const ch = interaction.guild.channels.cache.get(data?.phone?.gmc);
        if (!ch) {
            await interaction.editReply({ content: ':x: لم يتم العثور على شات منشورات' });
            return;
        }

        const isVerified = data?.verificationRole && interaction.member.roles.cache.has(data.verificationRole);
        if (isVerified && !userDoc.verified) {
            userDoc.verified = true;
            await userDoc.save();
        }

        if (!Array.isArray(userDoc.heartsFrom)) userDoc.heartsFrom = [];

        const imageBuffer = await renderPost({
            displayName,
            username,
            content: reportData,
            avatarURL,
            extraImageURL: imageLink,
            verified: isVerified
        });

        // أنشئ تقرير جديد داخل userDoc.reports
        if (!Array.isArray(userDoc.reports)) userDoc.reports = [];
        const reportId = uuidv4();
        const reportEntry = {
            id: reportId,
            messageId: null, // نحدّثه بعد الإرسال
            heartsFrom: [],
            createdAt: new Date(),
            channelId: ch.id
        };
        userDoc.reports.push(reportEntry);
        await userDoc.save();

        const button = new Discord.ButtonBuilder()
            .setCustomId(`heart_${reportId}`)
            .setLabel(`❤️ 0`)
            .setStyle(Discord.ButtonStyle.Danger);
        const row = new Discord.ActionRowBuilder().addComponents(button);

        const msg = await ch.send({
            content: `${interaction.user}`,
            files: [new Discord.AttachmentBuilder(imageBuffer, { name: isVerified ? 'report_post_verified.png' : 'report_post.png' })],
            components: [row]
        });

        // حدّث messageId في التقرير
        const targetReport = userDoc.reports.find(r => r.id === reportId);
        if (targetReport) {
            targetReport.messageId = msg.id;
            await userDoc.save();
        }

        await interaction.editReply({ content: 'تم نشر منشور الان' });
    }
};
