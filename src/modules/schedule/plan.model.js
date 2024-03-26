const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'place'
const COLLECTION_NAME = 'PLACE';


const placeSchema = new Schema({
    scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    address: { type: String, required: true },
    googleMapId: { type: String },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: COLLECTION_NAME
});


module.exports = model(DOCUMENT_NAME, placeSchema)