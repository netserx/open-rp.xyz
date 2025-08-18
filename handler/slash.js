const { glob } = require("glob");
const { promisify } = require("util");
const globPromise = promisify(glob);

module.exports = async (client) => {
    var array = [];
    const slashCommands = await globPromise(`${process.cwd()}/slashcommands/*/*.js`);

    slashCommands.map((value) => {
        const file = require(value);
        if (!file.name) return;

        client.slashCommands.set(file.name, file);

        array.push(file);
    });

    client.on("ready", async () => {
        await client.application?.commands.set(array)
    });

}