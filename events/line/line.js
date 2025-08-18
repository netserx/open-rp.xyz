const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: `messageCreate`,
    run: async (message, client) => {
        if(message.content.startsWith("colldown") || message.content.startsWith("-colldown")) {
            if(!message.member.permissions.has("8")) return;

            await message.delete();

            const embed = new EmbedBuilder()
                .setColor('#141414')
                .setDescription(`💵  Store <a:br8:1402629854268100679>  
🏠 House  <a:br8:1402629854268100679>  
<:Br8_0:1403781792389136595> Laundry  <a:br8:1402629854268100679>  
<:Br8_0:1403780684971249674> Laxury House <a:br8:1402629854268100679>  
<:Br8_0:1403780009352626328> Cash Exchange <a:br8:1402629854268100679> 
<:Br8_2:1403390393701240872> Bobcat <a:br8:1402629854268100679>  
<:Br8_0:1403779868503572551> Fleeca Bank  <a:br8:1402629854268100679>  
<:Br8_0:1403783181454282752> Blaine Cunty <a:br8:1402629854268100679>  
💎 Jewelry <a:br8:1402629854268100679>`);

            await message.channel.send({ embeds: [embed] });
        }
    }
};
