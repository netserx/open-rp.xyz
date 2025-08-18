const { Schema, model } = require('mongoose')

const Database = new Schema({
    guild: String,
    user: String,
    c1: {
        cash: { type: Number, default: 0 },
        bank: { type: Number, default: 0 },
        id: Object,
        inv: Array,
        clamped: { type: Boolean, default: false },
        clamp_before: { type: Boolean, default: false },
        builds: Array,
        cars: Array,
        police_points: {
            type: Array, default: [
                {
                    name: "login",
                    value: 0
                },
                {
                    name: "claim_report",
                    value: 0
                },
                {
                    name: "status",
                    value: 0
                },
                {
                    name: "others",
                    value: 0
                }
            ]
        }
    },
    c2: {
        cash: { type: Number, default: 0 },
        bank: { type: Number, default: 0 },
        id: Object,
        inv: Array,
        clamped: { type: Boolean, default: false },
        clamp_before: { type: Boolean, default: false },
        builds: Array,
        cars: Array,
        police_points: {
            type: Array, default: [
                {
                    name: "login",
                    value: 0
                },
                {
                    name: "claim_report",
                    value: 0
                },
                {
                    name: "status",
                    value: 0
                },
                {
                    name: "others",
                    value: 0
                }
            ]
        }
    },
    points: {
        id: { type: Number, default: 0 },
        gmc: { type: Number, default: 0 },
        start_game: { type: Number, default: 0 },
        join_game: { type: Number, default: 0 },
        take_ticket: { type: Number, default: 0 },
        take_report: { type: Number, default: 0 },
        others: { type: Number, default: 0 },
        tf3el: { type: Number, default: 0 }
    }
})

module.exports = model("userBase", Database)