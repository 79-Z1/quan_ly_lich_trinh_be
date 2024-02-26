const { Schema, model } = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'KeyToken';
const COLLECTION_NAME = 'KEYTOKEN';

var keyTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    publicKey: {
        type: String,
    },
    refreshToken: {
        type: String,
        required: true
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = model(DOCUMENT_NAME, keyTokenSchema);