const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'message'
const COLLECTION_NAME = 'MESSAGE';


const participantSchema = new Schema({
    _id: false,
    participantId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['blocked', 'normal'],
        default: 'normal'
    }
});

const reactionSchema = new Schema({
    _id: false,
    reacter: { type: Schema.Types.ObjectId, ref: 'User' },
    emotion: {
        type: String,
        enum: ['like', 'love', 'sad', 'angry', 'happy'],
        required: false,
        default: ''
    }
});

const messageSchema = new Schema({
    conservationId: { type: Schema.Types.ObjectId, ref: 'Conservation' },
    type: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    text: {
        type: String
    },
    pinned: {
        type: Boolean,
        default: false
    },
    reactions: {
        type: [reactionSchema],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: COLLECTION_NAME
});


module.exports = model(DOCUMENT_NAME, messageSchema)