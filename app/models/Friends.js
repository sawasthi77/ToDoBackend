const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Friend = new Schema({
    requestedById: {
        type: String
    },

    requestedToId: {
        type: String
    },

    status: {
        type: String
    },

    id: {
        type: String
    },

    requestedUserDetails: {
        type: Object
    },

    requestedByName: {
        type: String
    },

    requestedToName: {
        type: String
    }
})

module.exports = mongoose.model('Friend', Friend)
