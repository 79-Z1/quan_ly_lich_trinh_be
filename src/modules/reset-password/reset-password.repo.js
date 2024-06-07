'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const resetPasswordModel = require("../reset-password/reset-password.model");
const userModel = require("../user/user.model");
const crypto = require('crypto');
const { mailFormat } = require("../mail/forgot-password-mail-format");
const { sendMail } = require("../mail/send-mail");
const bcrypt = require('bcrypt');
const { toObjectId } = require("../../common/utils/object.util");

const generateUniqueToken = (email) => {
    const currentTime = Date.now().toString();
    const data = email + currentTime;
    return crypto.createHmac('sha256', process.env.API_KEY).update(data).digest('hex');
};

const sendResetPasswordRequest = async (email) => {
    try {
        const user = await userModel.findOne({
            email
        }).lean();

        if (!user) return false;
        const token = generateUniqueToken(email);

        const resetPassword = await resetPasswordModel.create({
            user: toObjectId(user._id),
            token: token
        });

        await sendMail(email, 'Reset password', mailFormat(`http://localhost:3000/forgot-password/${resetPassword.token}`));

    } catch (error) {
        throw new BadrequestError('Send reset password request failed');
    }
}

const resetPassword = async (newPassword, token) => {
    const user = await resetPasswordModel.findOne({
        token
    }).lean();
    if (!user) return false;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const userUpdate = await userModel.findOneAndUpdate({
        _id: user.user
    }, {
        password: passwordHash
    }, {
        new: true
    }).lean();
    return userUpdate;
}

const validateToken = async (token) => {
    const resetPasswordDoc = await resetPasswordModel.findOne({ token }).lean();

    if (!resetPasswordDoc) return false;

    const isExpired = Date.now() > new Date(resetPasswordDoc.expiredAt).getTime();

    if (isExpired) return false;

    return true;
};



module.exports = {
    sendResetPasswordRequest,
    resetPassword,
    validateToken
}
