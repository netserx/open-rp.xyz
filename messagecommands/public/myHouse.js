// messagecommands/public/myHouse.js
const userBase = require('../../Models/userBase');
const guildBase = require('../../Models/guildBase');
const Discord = require('discord.js');

module.exports = {
  name: 'myHouse',
  aliases: ['my-house','myhouse','عقاراتي'],
  run: async (client, context, args) => {
    try {
      // --- كشف آمن إذا context هو Interaction أو Message ---
      const isInteraction = Boolean(
        (typeof context?.isButton === 'function' && context.isButton()) ||
        (typeof context?.isCommand === 'function' && context.isCommand()) ||
        (!!context?.user && !context?.author) // Interaction عنده .user لكن Message عنده .author
      );

      const guild = context.guild;
      const user = isInteraction ? context.user : context.author;
      if (!guild) {
        const txt = ':x: | هذا الأمر يعمل فقط داخل السيرفر';
        return isInteraction ? context.reply({ content: txt, ephemeral: true }) : context.channel.send(txt);
      }

      // --- جلب قواعد البيانات ---
      let db = await guildBase.findOne({ guild: guild.id });
      if (!db) { db = new guildBase({ guild: guild.id }); await db.save(); }

      let check = db.joins.find(c => c.user === user.id);
      if (!check) {
        const replyObj = { content: ':x: | يجب تسجيل دخولك اولا حتى تتمكن من استخدام هذا الامر', ephemeral: true };
        return isInteraction ? context.reply(replyObj) : context.channel.send(replyObj.content);
      }

      let dataDoc = await userBase.findOne({ guild: guild.id, user: user.id });
      if (!dataDoc) { dataDoc = new userBase({ guild: guild.id, user: user.id }); await dataDoc.save(); }
      let data = dataDoc[check.character];

      if (data.clamped) {
        const replyObj = { content: '** - انت مكلبش لايمكنك استخدام هذا الامر**', ephemeral: true };
        return isInteraction ? context.reply(replyObj) : context.channel.send(replyObj.content);
      }

      // --- تجهيز العقارات ---
      const allbuilds = [];
      const buildsArr = [...(data.builds || [])];
      if (!buildsArr.length) {
        const c = `:x: | الشخصية ${check.character === 'c1' ? 'الاولى' : 'الثانية'} لا تملك عقارات`;
        return isInteraction ? context.reply({ content: c, ephemeral: true }) : context.channel.send(c);
      }
      while (buildsArr.length) allbuilds.push(buildsArr.splice(0, 1));

      function generateEmbed(page) {
        const b = allbuilds[page][0];
        return new Discord.EmbedBuilder()
          .setColor('#003d66')
          .setImage(b.image)
          .setDescription(`** — Apartment Name ( ${b.name} )
🚗 - Garage ( ${b.garage} )
📦 - Storage space ( ${b.storage} )
 - Apartment Location ( ${b.location} )
 - Apartment Price ( ${b.price.toLocaleString('en-US')} ) **`);
      }

      // --- أزرار مع customId فريد للمستخدم لتجنب التصادم ---
      let currentPage = 0;
      const backId = `myhouse_back_${user.id}`;
      const nextId = `myhouse_next_${user.id}`;

      const row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId(backId)
          .setLabel('⏪ رجوع')
          .setStyle(Discord.ButtonStyle.Secondary)
          .setDisabled(true),

        new Discord.ButtonBuilder()
          .setCustomId(nextId)
          .setLabel('تالي ⏩')
          .setStyle(Discord.ButtonStyle.Secondary)
          .setDisabled(allbuilds.length <= 1)
      );

      // --- إرسال الرسالة (لو Interaction نستخدم fetchReply:true عشان نحصل على الرسالة) ---
      let replyMsg;
      if (isInteraction) {
        replyMsg = await context.reply({ embeds: [generateEmbed(currentPage)], components: [row], ephemeral: true, fetchReply: true });
      } else {
        replyMsg = await context.channel.send({ embeds: [generateEmbed(currentPage)], components: [row] });
      }

      // --- Collector مُقيَّد على هذا المستخدم والأزرار الفريدة ---
      const filter = i => (i.customId === backId || i.customId === nextId) && i.user.id === user.id;
      const collector = replyMsg.createMessageComponentCollector({ filter, componentType: Discord.ComponentType.Button, time: 60 * 60 * 1000 });

      collector.on('collect', async i => {
        // دائمًا استخدم i.update() عشان ترد على interaction وتحدّث الرسالة
        if (i.customId === backId) {
          currentPage = (currentPage - 1 + allbuilds.length) % allbuilds.length;
        } else if (i.customId === nextId) {
          currentPage = (currentPage + 1) % allbuilds.length;
        }

        // تحديث حالات التعطيل (لو عايز تعطل عند الأطراف بدل الدوران غير دورة)
        row.components[0].setDisabled(currentPage === 0);
        row.components[1].setDisabled(currentPage === allbuilds.length - 1);

        await i.update({ embeds: [generateEmbed(currentPage)], components: [row] }).catch(err => {
          console.error('Failed to update myHouse message:', err);
        });
      });

      collector.on('end', () => {
        // إن أردت إزالة الأزرار بعد انتهاء الوقت:
        try { replyMsg.edit({ components: [] }).catch(() => {}); } catch {}
      });

    } catch (err) {
      console.error('myHouse error =>', err);
      try {
        if (context && typeof context.reply === 'function') {
          await context.reply({ content: 'حدث خطأ أثناء تنفيذ الأمر ❌', ephemeral: true });
        }
      } catch {}
    }
  }
};
