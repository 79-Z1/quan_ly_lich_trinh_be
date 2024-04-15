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

}

module.exports = new UserController();