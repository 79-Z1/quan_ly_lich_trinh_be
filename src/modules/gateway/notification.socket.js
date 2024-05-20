const { logger } = require("../../common/helpers/logger");
const { pushNotification, markAsRead } = require("../notification/notification.repo");


const notificationEvent = async (socket, selfId) => {

    try {
        socket.on('push-notification', async ({ userId, content, url }) => {
            try {
                const notifications = await pushNotification({ emitter: selfId, userId, content, url })
                global._io.to(userId).emit('update-notification', { notifications })
            } catch (error) {
                console.log(error);
            }
        });
        socket.on('mark-as-read', async () => {
            try {
                const notifications = await markAsRead(selfId)
                global._io.to(selfId).emit('update-notification', { notifications })
            } catch (error) {
                console.log(error);
            }
        });
    } catch (error) {
        logger.error(`Socket chat error:::`, err);
    }
}

module.exports = {
    notificationEvent
};
