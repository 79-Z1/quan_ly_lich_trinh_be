'use strict';
const { SuccessResponse } = require("../../common/core/success.response");
const UserService = require("./user.service");

class UserController {

    searchUsersByName = async (req, res) => {
        new SuccessResponse({
            message: 'Search users by name successfully',
            metadata: await UserService.searchUsersByName(req.query.name)
        }).send(res);
    }

    getUserProfile = async (req, res) => {
        new SuccessResponse({
            message: 'Get friend profile successfully',
            metadata: await UserService.getUserProfile(req.user.userId, req.params.userId)
        }).send(res);
    }

}

module.exports = new UserController();