const { Schema, model } = require('mongoose');

const Database = new Schema({
    guild: String,
    idd: {
        admin: String,
        channel: String,
        role: String,
        log: String
    },
    points_admin: String,
    games_admin: String,
    joins: [{
        user: String,
        character: String,
        timestamp: Number
    }],
    policejoins: Array,
    game: { type: Boolean, default: false },
    staff_role: String,
    game_channels: {
        start_game: String,
        ads: String,
        join: String
    },
    comes: {
        admin: String,
        channel: String,
        all: Array,
        log: String
    },
    tf3el: {
        add: Array,
        remove: Array,
        log: String
    },
    count: {
        support: { type: Number, default: 1 },
        high: { type: Number, default: 1 },
        comp: { type: Number, default: 1 },
        add: { type: Number, default: 1 },
        store: { type: Number, default: 1 }
    },
    claimed: [],
    bank_log: String,
    bank_admin: String,
    inv_admin: String,
    status: Object,
    show_inv_channel: String,
    tshher_channel: String,
    magic_admin: String,
    gmc_admin: String,
    police_admin: String,
    phone: {
        nineoneone: String,
        gmc: String,
    },
    levels: {
        "1": String,
        "2": String,
        "3": String,
        "4": String,
        "5": String
    },
    make_log: String,
    police_log: String,
    blacklist: String,
    reasons: { type: Array, default: [] },
    ban_log: String,
    ban_chat_log: String,
    police_high: String,
    joinChannels: {
        login: String,
        list: String,
        first: String
    },
    listMessage: String,

    // إضافة رتبة التوثيق التلقائي
    verificationRole: { type: String, default: null },

    theftLogChannel: { type: String, default: null },  // قناة تفاصيل السرقة
    theftMentionRole: { type: String, default: null } // الرتبة اللي يتم منشنها

});

module.exports = model("guildBase", Database);
