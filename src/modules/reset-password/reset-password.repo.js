'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId, getInfoData } = require("../../common/utils/object.util");
const resetPasswordModel = require("../reset-password/reset-password.model");
const userModel = require("../user/user.model");
const crypto = require('crypto');
const nodeMailer = require('nodemailer');
const { mailFormat } = require("./mail-format");

const generateUniqueToken = (email) => {
    const currentTime = Date.now().toString();
    const data = email + currentTime;
    return crypto.createHmac('sha256', process.env.API_KEY).update(data).digest('hex');
};


const sendMail = async (to, subject, htmlContent) => {
    try {
        const adminEmail = 'bellion029@gmail.com';
        const transporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: 'hoa.tk.62kdtm@ntu.edu.vn',
                pass: '044202002104'
            }
        });
        const options = {
            from: adminEmail,
            to: to,
            subject: subject,
            html: htmlContent
        }
        return await transporter.sendMail(options);
    } catch (error) {
        throw new BadrequestError('Send mail failed');
    }
}

const sendResetPasswordRequest = async (email) => {
    try {
        const user = await userModel.findOne({
            email
        }).lean();

        if (!user) return false;
        const token = generateUniqueToken(email);

        // const resetPassword = await resetPasswordModel.create({
        //     user: toObjectId(user._id),
        //     token: token
        // });

        await sendMail(email, 'Reset password', mailFormat(`http://localhost:3000/reset-password/${token}`));

    } catch (error) {
        console.log("🚀 ~ sendResetPasswordRequest ~ error:::", error);
        throw new BadrequestError('Send reset password request failed');
    }
}



module.exports = {
    sendResetPasswordRequest
}
