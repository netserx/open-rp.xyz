const { Schema, model } = require('mongoose')

const Database = new Schema({
    guild: String,
    user: String,
    reason: String,
    blacklisted_roles: Array,
    time: Number
})

module.exports = model("Blacklisted", Database)