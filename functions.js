const Discord = require('discord.js');
const userBase = require("./Models/userBase");
const guildBase = require("./Models/guildBase");

module.exports = {
    checkCount: async (guild) => {
        let data = await guildBase.findOne({ guild: guild.id });
        if (!data) {
            data = new guildBase({ guild: guild.id, policejoins: [] });
            await data.save();
        }

        let number = data.policejoins.length;
        let message = ` 💵  Store <a:br8:1402629854268100679>  
 🏠 House  <a:br8:1402629854268100679>  
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402629854268100679>  
 <:Br8_0:1403780684971249674> Laxury House <a:br8:1402629854268100679>  
 <:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402629854268100679> 
 <:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679>  
 <:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679>  
 <:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679>  
 💎 Jewelry <a:br8:1402629854268100679>  `;

        if (number === 0) {
            message = ` 💵  Store <a:br8:1402629854268100679>  
 🏠 House  <a:br8:1402629854268100679>  
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402629854268100679>  
 <:Br8_0:1403780684971249674> Laxury House <a:br8:1402629854268100679>  
 <:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402629854268100679> 
 <:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679>  
 <:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679>  
 <:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679>  
 💎 Jewelry <a:br8:1402629854268100679>  `;
        } else if (number === 4) {
            message = `   
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402629854268100679> 
<:Br8_0:1403781792389136595> Laundry  <a:br8:1402629854268100679> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402629854268100679> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402629854268100679>
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679> 
💎 Jewelry <a:br8:1402629854268100679>   `;
        } else if (number === 5) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402629854268100679> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402629854268100679> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402629854268100679>
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679> 
💎 Jewelry <a:br8:1402629854268100679> 
  `;
        } else if (number === 5) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402630180375232523> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402629854268100679> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402629854268100679>
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679> 
💎 Jewelry <a:br8:1402629854268100679> 
 `;
        } else if (number === 6) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402630180375232523> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402630180375232523> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402629854268100679>
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679> 
💎 Jewelry <a:br8:1402629854268100679> 
  `;
        } else if (number === 6) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402630180375232523> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402630180375232523> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402630180375232523> 
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679> 
💎 Jewelry <a:br8:1402629854268100679> 
 `;
        } else if (number === 7) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402630180375232523> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402630180375232523> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402630180375232523> 
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402630180375232523> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679> 
💎 Jewelry <a:br8:1402629854268100679> 
  `;
        } else if (number === 7) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402630180375232523> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402630180375232523> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402630180375232523> 
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402630180375232523> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402630180375232523> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679> 
💎 Jewelry <a:br8:1402629854268100679> 
  `;
        } else if (number === 9) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402630180375232523> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402630180375232523> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402630180375232523> 
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402630180375232523> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402630180375232523> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402630180375232523> 
💎 Jewelry <a:br8:1402629854268100679> 

  `;
        } else if (number >= 10) {
            message = `  
💵  Store <a:br8:1402630180375232523> 
🏠 House  <a:br8:1402630180375232523> 
 <:Br8_0:1403781792389136595> Laundry  <a:br8:1402630180375232523> 
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402630180375232523> 
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402630180375232523> 
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402630180375232523> 
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402630180375232523> 
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402630180375232523> 
💎 Jewelry <a:br8:1402630180375232523> 
  `;
        }

        if (!data.joinChannels || !data.joinChannels.first) return;
        let channel = guild.channels.cache.get(data.joinChannels.first);
        if (!channel) return;

// حذف آخر رسالة في القناة
const fetched = await channel.messages.fetch({ limit: 1 });
const lastMessage = fetched.first();
if (lastMessage) await lastMessage.delete();



        let embed = new Discord.EmbedBuilder()
            .setColor("#030292")
            .setDescription(`  - Police Priority\n\n${message} `);

        await channel.send({ embeds: [embed], content: `` });
    },

    addPolicePoint: async (guild, user, character, type, num) => {
        let db = await userBase.findOne({ guild: guild, user: user });
        if (!db) {
            db = new userBase({ guild: guild, user: user });
            await db.save();
        }

        db = db[character];
        let points = db.police_points.find(c => c.name.toLowerCase() === type.toLowerCase()).value;

        await userBase.updateOne(
            { guild: guild, user: user, [`${character}.police_points.name`]: `${type}` },
            { $set: { [`${character}.police_points.$.value`]: points + parseInt(num) } }
        );
    }
};













