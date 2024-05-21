'use strict';
const { SuccessResponse } = require("../../common/core/success.response");
const ResetPasswordService = require("./reset-password.service");

class ResetPasswordController {

    sendResetPasswordRequest = async (req, res) => {
        new SuccessResponse({
            message: 'Send reset password request successfully',
            metadata: await ResetPasswordService.sendResetPasswordRequest(req.body.email)
        }).send(res);
    }

    resetPassword = async (req, res) => {
        new SuccessResponse({
            message: 'Reset password successfully',
            metadata: await ResetPasswordService.resetPassword(req.body.newPassword, req.body.token)
        }).send(res);
    }

    validateToken = async (req, res) => {
        new SuccessResponse({
            message: 'Validate token successfully',
            metadata: await ResetPasswordService.validateToken(req.params.token)
        }).send(res);
    }

}

module.exports = new ResetPasswordController();