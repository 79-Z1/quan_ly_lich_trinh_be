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

    getUserSettings = async (req, res) => {
        new SuccessResponse({
            message: 'Get user settings successfully',
            metadata: await UserService.getUserSettings(req.user.userId)
        }).send(res);
    }

    updateUser = async (req, res) => {
        new SuccessResponse({
            message: 'Update user successfully',
            metadata: await UserService.updateUser(req.user.userId, req.body)
        }).send(res);
    }

    suggestFriends = async (req, res) => {
        new SuccessResponse({
            message: 'Suggest friends successfully',
            metadata: await UserService.suggestFriends(req.user.userId)
        }).send(res);
    }

    updateUserLocation = async (req, res) => {
        new SuccessResponse({
            message: 'Update user location successfully',
            metadata: await UserService.updateUserLocation(req.user.userId, req.body.location)
        }).send(res);
    }

}

module.exports = new UserController();