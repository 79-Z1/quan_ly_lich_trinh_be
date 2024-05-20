'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const notificationRepo = require("./notification.repo");


class NotificationService {
    static pushNotification = async ({ userId, content, url }) => {
        try {
            logger.info(`NotificationService -> pushNotification [START]\n(INPUT) ${handleObject({ userId, content, url })}`)
            const newNotification = await notificationRepo.pushNotification({ userId, content, url });

            logger.info(`NotificationService -> pushNotification [END]\n(OUTPUT) ${handleObject({ newNotification })}`)
            return newNotification;
        } catch (error) {
            throw new BadrequestError('Update user failed')
        }
    }


    static get = async (userId) => {
        try {
            logger.info(`NotificationService -> get [START]\n(INPUT) ${handleObject({ userId })}`)
            const notifications = await notificationRepo.get(userId);

            logger.info(`NotificationService -> get [END]\n(OUTPUT) ${handleObject({ notifications })}`)
            return notifications;
        } catch (error) {
            throw new BadrequestError('Get notifications failed')
        }
    }
}

module.exports = NotificationService;
