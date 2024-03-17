const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'conservation'
const COLLECTION_NAME = 'CONSERVATION';


const participantSchema = new Schema({
    _id: false,
    participantId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['blocked', 'normal'],
        default: 'normal'
    }
});

const conservationSchema = new Schema({
    creatorId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    type: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    participants: {
        type: [participantSchema],
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


module.exports = model(DOCUMENT_NAME, conservationSchema)