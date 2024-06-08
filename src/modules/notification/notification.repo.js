'use strict';

const { orderBy } = require("lodash");
const { BadrequestError } = require("../../common/core/error.response");
const notificationModel = require("./notification.model");


const get = async (userId) => {
    try {
        const notifications = await notificationModel.find({ user: userId }).populate({
            path: 'emitter',
            select: 'name avatar _id'
        }).lean();
        return orderBy(notifications, ['createdAt'], ['desc']);
    } catch (error) {
        throw new BadrequestError('Get notifications failed')
    }
}

const pushNotification = async ({ emitter = null, userId, content, url }) => {
    try {
        if (!emitter) {
            await notificationModel.create({ user: userId, content, url, type: 'system' });
        } else {
            await notificationModel.create({ emitter, user: userId, content, url });
        }
        const notifications = await get(userId);
        return notifications;
    } catch (error) {
        throw new BadrequestError('Push notification event failed')
    }
}

const markAsRead = async (userId) => {
    try {
        await notificationModel.updateMany({ user: userId, seen: false }, { seen: true });
        const notifications = await get(userId);
        return notifications;
    } catch (error) {
        throw new BadrequestError('Mark as read event failed')
    }
};

module.exports = {
    get,
    pushNotification,
    markAsRead
}
