const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'ResetPassword';
const COLLECTION_NAME = 'RESETPASSWORD';


const resetPasswordSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    token: {
        type: String,
        required: true
    },
    expiredAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 60 * 1000)
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, resetPasswordSchema);