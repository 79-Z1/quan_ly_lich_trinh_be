const { logger } = require("../../common/helpers/logger");
const { updateUserSocketId } = require("../user/user.repo");
const { chatEvent } = require("./chat.socket");
const { friendEvent } = require("./friend.socket");
const { notificationEvent } = require("./notification.socket");

const connection = async (socket) => {
    const userId = socket.handshake?.auth?.userId
    if (!userId) return
    logger.info(`------- A user connected! || id: ${userId} -------`);


    try {
        socket.join(userId);
        updateUserSocketId(userId, socket.id);
        //# HANDLE FRIEND EVENT
        await friendEvent(socket, userId);
        //# HANDLE NOTIFICATION EVENT
        await notificationEvent(socket, userId);
    } catch (error) {
        logger.error(error);
    }


    //# HANDLE DISCONNECT
    await socket.on('disconnect', () => {
        logger.info(`####### A user disconnected! || id: ${socket.id} #######`);
    });
};

module.exports = {
    connection
};