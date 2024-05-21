'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { sendResetPasswordRequest, resetPassword, validateToken } = require("./reset-password.repo");

class ResetPasswordService {

    static async sendResetPasswordRequest(email) {
        try {
            logger.info(
                `ResetPasswordService -> sendResetPasswordRequest [START]\n(INPUT)`
            )
            const status = await sendResetPasswordRequest(email)
            logger.info(
                `ResetPasswordService -> sendResetPasswordRequest [END]\n(OUTPUT) ${handleObject({ status })
                }`
            )
            return status
        } catch (error) {
            throw new BadrequestError('Send reset password request failed');
        }
    }

    static resetPassword = async (newPassword, token) => {
        try {
            logger.info(
                `ResetPasswordService -> resetPassword [START]\n(INPUT)`
            )
            const status = await resetPassword(newPassword, token)
            logger.info(
                `ResetPasswordService -> resetPassword [END]\n(OUTPUT) ${handleObject({ status })
                }`
            )
            return status
        } catch (error) {
            throw new BadrequestError('Reset password failed');
        }
    }

    static validateToken = async (token) => {
        try {
            logger.info(
                `ResetPasswordService -> validateToken [START]\n(INPUT)`
            )
            const status = await validateToken(token)
            logger.info(
                `ResetPasswordService -> validateToken [END]\n(OUTPUT) ${handleObject({ status })
                }`
            )
            return status

        } catch (error) {
            throw new BadrequestError('Validate token failed');
        }
    }
}

module.exports = ResetPasswordService;
