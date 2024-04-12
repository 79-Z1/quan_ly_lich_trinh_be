const { logger } = require("../../common/helpers/logger");
const { getFriendsReceived, getFriendForSocket } = require("../friend/friend.repo");
const { findUserSocketId } = require("../user/user.repo");

const friendEvent = async (socket, userId) => {

    try {
        socket.on('remove-friend-request', ({ friendSocketId }) =>
            socket.to(friendSocketId).emit('receive-message', JSON.stringify({ message, userId: socket.userId }))
        );

        socket.on('send-friend-request', async ({ friendId, userId }) => {
            try {
                const friend = await getFriendForSocket(friendId)
                const user = await getFriendForSocket(userId)
                // socket.to(socket.id).emit('update-friend-sent', JSON.stringify({ friendsRequestSent }))
                socket.to(friend.user.socketId).emit('update-friend', { friend: user, type: 'send' })
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('reject-friend-request', async ({ friendId }) => {
            const friend = await getFriendForSocket(friendId)
            socket.to(friend.user.socketId).emit('update-friend', { friend, type: 'reject' })
        });

        socket.on('remove-friend-request-sent', async ({ friendId }) => {
            const friend = await getFriendForSocket(friendId)
            socket.to(friend.user.socketId).emit('update-friend', { friend, type: 'cancel-send' })
        });

        socket.on('accept-friend-request', async ({ friendId, userId }) => {
            const friend = await getFriendForSocket(friendId)
            const user = await getFriendForSocket(userId)
            socket.to(friend.user.socketId).emit('update-friend', { friend: user, type: 'accept' })
        });

        socket.on('un-friend', async ({ friendId }) => {
            const friend = await getFriendForSocket(friendId)
            socket.to(friend.user.socketId).emit('update-friend', { friend, type: 'un-friend' })
        });
    } catch (error) {
        logger.error(`Socket friend error:::`, err);
    }
}

module.exports = {
    friendEvent
};
