const { BadrequestError } = require("../../common/core/error.response");
const nodeMailer = require('nodemailer');

const sendMail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const options = {
            from: process.env.MAIL_ADDRESS,
            to: to,
            subject: subject,
            html: htmlContent
        }
        return await transporter.sendMail(options);
    } catch (error) {
        console.log("🚀 ~ sendMail ~ error:::", error);
        throw new BadrequestError('Send mail failed');
    }
}

module.exports = { sendMail }