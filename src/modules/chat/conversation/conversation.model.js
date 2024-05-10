const { Schema, model } = require('mongoose');
const CONVERSATION_DOCUMENT_NAME = 'Conversation';
const CONVERSATION_COLLECTION_NAME = 'CONVERSATION';

const participantSchema = new Schema({
    _id: false,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
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
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
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
    },
    messageAt: {
        type: Date,
        default: Date.now()
    }
});

const conversationSchema = new Schema({
    creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: {
        type: String
    },
    imageUrl: {
        type: String
    },
    participants: {
        type: [participantSchema],
        default: []
    },
    type: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    messages: {
        type: [messageSchema],
        default: []
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: CONVERSATION_COLLECTION_NAME
});

module.exports = model(CONVERSATION_DOCUMENT_NAME, conversationSchema);