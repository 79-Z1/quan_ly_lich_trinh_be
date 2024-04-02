const mongoose = require('mongoose');
const DOCUMENT_NAME = 'Friend'
const COLLECTION_NAME = 'FRIEND';
const moment = require('moment-timezone').tz('Asia/Ho_Chi_Minh');


const friendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    friends: {
        _id: false,
        default: [],
        type: [{
            friendId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: moment.format()
            },
            updatedAt: {
                type: Date,
                default: moment.format()
            }
        }]
    },
    friendsRequestReceved: {
        _id: false,
        default: [],
        type: [{
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: moment.format()
            },
            updatedAt: {
                type: Date,
                default: moment.format()
            }
        }]
    },
    friendsRequestSent: {
        _id: false,
        default: [],
        type: [{
            recipientId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: moment.format()
            },
            updatedAt: {
                type: Date,
                default: moment.format()
            }
        }]
    }
}, {
    collection: COLLECTION_NAME
});

friendSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.Friends.forEach(friend => {
            friend.updatedAt = moment.format();
        });
        this.Friends_Request.forEach(request => {
            request.updatedAt = moment.format();
        });
        this.friendsRequestSent.forEach(requestSent => {
            requestSent.updatedAt = moment.format();
        });
    }
    next();
});

module.exports = mongoose.model(DOCUMENT_NAME, friendSchema);
