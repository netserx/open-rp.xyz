const { readdirSync } = require("node:fs")

module.exports = async (client) => {
    const event = readdirSync(process.cwd() + '/messagecommands').filter(file => !file.endsWith('.js'))

    for (const folder of event) {
        const event2 = readdirSync(process.cwd() + `/messagecommands/${folder}`).filter(file => file.endsWith('.js'))

        for (const file of event2) {
            const command = require(`../messagecommands/${folder}/${file}`)

            if (command.aliases) {
                command.aliases.forEach(alias => {
                    client.messageCommands.set(alias, command);
                    client.messageCommands.set(command.name, command)
                })
            } else {
                client.messageCommands.set(command.name, command)
            }
        }
    }
}