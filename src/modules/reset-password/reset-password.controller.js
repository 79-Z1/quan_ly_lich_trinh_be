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

}

module.exports = new ResetPasswordController();