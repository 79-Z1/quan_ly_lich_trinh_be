const { logger } = require("../../common/helpers/logger");
const { updateUserStatus } = require("../user/user.repo");
const { friendEvent } = require("./friend.socket");
const { notificationEvent } = require("./notification.socket");

const connection = async (socket) => {
    const userId = socket.handshake?.auth?.userId;
    if (!userId) return;
    logger.info(`------- A user connected! || id: ${userId} -------`);

    try {
        socket.join(userId);
        updateUserStatus(userId, true).catch(error => logger.error(`Error updating user status on connection: ${error.message}`));

        // Handle friend events
        await friendEvent(socket, userId);

        // Handle notification events
        await notificationEvent(socket, userId);
    } catch (error) {
        logger.error(`Error during connection handling: ${error.message}`);
    }

    // Handle disconnect
    socket.on('disconnect', () => {
        updateUserStatus(userId, false).catch(error => logger.error(`Error updating user status on disconnect: ${error.message}`));
        logger.info(`####### A user disconnected! || id: ${socket.id} #######`);
    });
};

module.exports = {
    connection
};
