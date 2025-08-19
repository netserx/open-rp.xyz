// require("dotenv").config();
// require("events").setMaxListeners(10000);

// const mongoose = require('mongoose');
// mongoose.set('strictQuery', true);

// const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('Database Connected'))
//   .catch((err) => console.error('DB connect error:', err));

// const createBot = (token, nameSuffix) => {
//   const client = new Client({
//     intents: [
//       GatewayIntentBits.MessageContent,
//       GatewayIntentBits.Guilds,
//       GatewayIntentBits.GuildMembers,
//       GatewayIntentBits.GuildMessages,
//       GatewayIntentBits.DirectMessages
//     ],
//     partials: [
//       Partials.GuildScheduledEvent,
//       Partials.Reaction,
//       Partials.Message,
//       Partials.User,
//       Partials.Channel,
//       Partials.GuildMember
//     ]
//   });

//   client.messageCommands = new Collection();
//   client.slashCommands = new Collection();


//   ["events", "slash", "message"].forEach(file => {
//     require(`./handler/${file}`)(client);
//   });

//   client.on('ready', () => {
//     console.log(`✅ ${client.user.tag} (بوت ${nameSuffix}) جاهز`);
//   });

//   client.on('error', console.error);
//   client.on('warn', console.warn);



//   process.on('uncaughtException', (error) => {
//     console.error(`Uncaught Exception (${nameSuffix}):`, error);
//   });

//   process.on('unhandledRejection', (reason, promise) => {
//     console.error(`Unhandled Rejection (${nameSuffix}) at:`, promise, 'reason:', reason);
//   });

//   client.login(token).catch(err => {
//     console.error(`فشل تسجيل الدخول للـ بوت ${nameSuffix}:`, err);
//   });

//   return client;
// };


const bot1 = createBot(process.env.TOKEN1, "الأول");
const bot2 = createBot(process.env.TOKEN2, "التاني");

