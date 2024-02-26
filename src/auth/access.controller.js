'use strict';
const { SuccessResponse, CREATED } = require("../common/core/success.response");
const AccessService = require("./access.service");

class AccessController {

    authentication = async (req, res, next) => {
        new SuccessResponse({
            message: 'Access successfully',
            metadata: await AccessService.authentication(req)
        }).send(res);
    }

    handleRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Get token successfully",
            metadata: await AccessService.handleRefreshToken({
                user: req.user,
                refreshToken: req.refreshToken,
                keyStore: req.keyStore
            })
        }).send(res);
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Logout successfully",
            metadata: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            message: "Login successfully",
            metadata: await AccessService.login(req.body)
        }).send(res);
    }

    signUp = async (req, res, next) => {
        return new CREATED({
            message: "Signup successfully",
            metadata: await AccessService.signUp(req.body)
        }).send(res);
    }
}

module.exports = new AccessController();