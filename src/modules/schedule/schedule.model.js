const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'Schedule'
const COLLECTION_NAME = 'SCHEDULE';


const eventSchema = new Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    address: { type: String, required: true },
    googleMapId: { type: String }
});

const scheduleSchema = new Schema({
    topic: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    events: {
        type: [eventSchema],
        default: []
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
        default: ['PENDING']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: COLLECTION_NAME
});

const memberSchema = new Schema({
    scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    memberId: { type: Schema.Types.ObjectId, ref: 'User' },
    permission: {
        type: String,
        enum: ['EDIT', 'VIEW'],
        default: 'VIEW'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'MEMBER'
});

module.exports = {
    Schedule: model(DOCUMENT_NAME, scheduleSchema),
    Member: model('Member', memberSchema)
}