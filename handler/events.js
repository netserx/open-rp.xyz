const fs = require("node:fs");
module.exports = async (client) => {
  fs.readdirSync(process.cwd() + "/events/").forEach((dirFile) => {

    const events = fs.readdirSync(process.cwd() + `/events/${dirFile}/`).filter((file2) => file2.endsWith(".js"));

    for (const file2 of events) {
      const event = require(`../events/${dirFile}/${file2}`);
      if (event.name) {
        try {
          client.on(event.name, (...args) => event.run(...args, client));
        } catch (err) {
          console.log("[ERROR]" + event.name);
        }
      }
    }

  });
};
