const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'Schedule'
const COLLECTION_NAME = 'SCHEDULE';


const memberSchema = new Schema({
    _id: false,
    memberId: { type: Schema.Types.ObjectId, ref: 'User' },
    permission: {
        type: String,
        enum: ['edit', 'view'],
        default: 'view'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const planSchema = new Schema({
    title: { type: String, required: true },
    cost: { type: Number },
    imageUrl: {
        type: String,
        trim: true
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    address: { type: String, required: true },
    location: { lat: Number, lng: Number },
    isActive: {
        type: Boolean,
        default: true
    }
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
    imageUrl: {
        type: String,
        trim: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    members: {
        type: [memberSchema],
        default: []
    },
    total: {
        type: Number,
        default: 0
    },
    plans: {
        type: [planSchema],
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
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: COLLECTION_NAME
});

module.exports = {
    Schedule: model(DOCUMENT_NAME, scheduleSchema),
}