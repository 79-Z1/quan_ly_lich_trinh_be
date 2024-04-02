const { getFriendsReceived, getFriendForSocket } = require("../friend/friend.repo");
const { findUserSocketId } = require("../user/user.repo");

const friendEvent = async (socket, userId) => {

    socket.on('remove-friend-request', ({ friendSocketId }) =>
        socket.to(friendSocketId).emit('receive-message', JSON.stringify({ message, userId: socket.userId }))
    );

    socket.on('send-friend-request', async ({ friendId }) => {
        try {
            const { socketId: friendSocket } = await findUserSocketId(friendId);
            const friendsRequestRecevied = await getFriendsReceived(friendId);
            // socket.to(socket.id).emit('update-friend-sent', JSON.stringify({ friendsRequestSent }))
            socket.to(friendSocket).emit('update-friend-request', (friendsRequestRecevied))
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('reject-friend-request', async ({ friendId }) => {
        const friend = await getFriendForSocket(friendId)
        socket.to(friend.user.socketId).emit('update-friend', { friend, type: 'reject' })
    });

    socket.on('accept-friend-request', async ({ friendId }) => {
        const friend = await getFriendForSocket(friendId)
        socket.to(friend.user.socketId).emit('update-friend', { friend, type: 'accept' })
    });

    socket.on('un-friend', async ({ friendId }) => {
        const friend = await getFriendForSocket(friendId)
        socket.to(friend.user.socketId).emit('update-friend', { friend, type: 'un-friend' })
    });
}

module.exports = {
    friendEvent
};
