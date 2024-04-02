const { logger } = require("../../common/helpers/logger");
const { updateUserSocketId } = require("../user/user.repo");
const { friendEvent } = require("./friend.socket");
let userId;

const connection = async (socket) => {
    logger.info(`------- A user connected! || id: ${socket.id} -------`);

    socket.on('set-user-socket-id', ({ userId }) => {
        userId = userId;
        updateUserSocketId(userId, socket.id);
        logger.info(`User ${userId} ==> socket ${socket.id}`);
    });

    //# HANDLE FRIEND EVENT
    await friendEvent(socket, userId);

    //# HANDLE DISCONNECT
    await socket.on('disconnect', () => {
        logger.info(`####### A user disconnected! || id: ${socket.id} #######`);
    });
};

module.exports = {
    connection
};