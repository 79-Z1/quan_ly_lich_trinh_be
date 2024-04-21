const { logger } = require("../../common/helpers/logger");
const { updateUserSocketId } = require("../user/user.repo");
const { chatEvent } = require("./chat.socket");
const { friendEvent } = require("./friend.socket");

const connection = async (socket) => {
    logger.info(`------- A user connected! || id: ${socket.id} -------`);

    await socket.on('set-user-socket-id', async ({ userId }) => {
        try {
            updateUserSocketId(userId, socket.id);
            logger.info(`User ${userId} ==> socket ${socket.id}`);
            //# HANDLE FRIEND EVENT
            await friendEvent(socket, userId);

            //# HANDLE CHAT EVENT
            await chatEvent(socket, userId);
        } catch (error) {
            logger.error(error);
        }
    });

    //# HANDLE DISCONNECT
    await socket.on('disconnect', () => {
        logger.info(`####### A user disconnected! || id: ${socket.id} #######`);
    });
};

module.exports = {
    connection
};