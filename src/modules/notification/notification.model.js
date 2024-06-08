const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'NOTIFICATION';


const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['system', 'client'],
        default: 'client'
    },
    emitter: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    content: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, notificationSchema);