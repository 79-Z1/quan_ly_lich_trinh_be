'use strict';
const { SuccessResponse } = require("../../common/core/success.response");
const NotificationService = require("./notification.service");

class NotificationController {

    get = async (req, res) => {
        new SuccessResponse({
            message: 'Get notifications successfully',
            metadata: await NotificationService.get(req.user.userId)
        }).send(res);
    }

    pushNotification = async (req, res) => {
        new SuccessResponse({
            message: 'Push notification successfully',
            metadata: await NotificationService.pushNotification(req.body)
        }).send(res);
    }

}

module.exports = new NotificationController();