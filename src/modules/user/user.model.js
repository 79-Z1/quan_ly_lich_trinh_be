const { Schema, model } = require('mongoose');
const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'USER';
const bcrypt = require('bcrypt');


const userSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        trim: true,
        maxLength: 100,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        validate: {
            validator: isValidEmail,
            message: '{VALUE} is not a valid email',
        }
    },
    address: {
        type: String,
        validate: {
            validator: isContainSpecialChar,
            message: '{VALUE} is not a valid address',
        }
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        validate: {
            validator: isValidPhoneNumber,
            message: '{VALUE} is not a valid phone number',
        }
    },
    providerAccountId: {
        type: String
    },
    provider: {
        type: String,
        enum: ['CREDENTIALS', 'GOOGLE', 'FACEBOOK'],
        default: 'CREDENTIALS'
    },
    authType: {
        type: String,
        enum: ['CREDENTIALS', 'OAUTH'],
        default: 'CREDENTIALS'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: COLLECTION_NAME
});

function isValidPhoneNumber(value) {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    return phoneRegex.test(value);
}

function isValidEmail(value) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return emailRegex.test(value);
}

function isContainSpecialChar(value) {
    const specRegex = /^[a-zA-Z0-9 ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸ]*$/
    return specRegex.test(value);
}

module.exports = model(DOCUMENT_NAME, userSchema);