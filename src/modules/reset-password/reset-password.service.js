'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { sendResetPasswordRequest } = require("./reset-password.repo");

class ResetPasswordService {

    static async sendResetPasswordRequest(email) {
        try {
            logger.info(
                `ResetPasswordService -> sendResetPasswordRequest [START]\n(INPUT)`
            )
            const users = await sendResetPasswordRequest(email)
            logger.info(
                `ResetPasswordService -> sendResetPasswordRequest [END]\n(OUTPUT) ${handleObject({ users })
                }`
            )
            return users
        } catch (error) {
            console.log("🚀 ~ ResetPasswordService ~ sendResetPasswordRequest ~ error:::", error);
            throw new BadrequestError('Send reset password request failed');
        }
    }

}

module.exports = ResetPasswordService;
