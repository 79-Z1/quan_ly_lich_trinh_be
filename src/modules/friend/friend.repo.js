const { toObjectId, getUnSelectData, getInfoData } = require('../../common/utils');
const { BadrequestError } = require('../../common/core/error.response');
const Friend = require('./friend.model');
const User = require('../user/user.model');


const getFriendListByUserId = async (userId) => {
    try {
        const user = await Friend.findOne({ userId: toObjectId(userId) });

        if (!user) return null;

        const friendList = await Promise.all(user.friends.map(async (friend) => {
            const userFriend = await User.findById(toObjectId(friend.friendId))
                .select(getUnSelectData(['__v', 'createdAt', 'updatedAt', 'password']))
            return userFriend
        }));

        return friendList ? friendList : null
    } catch (error) {
        throw new BadrequestError('Get friend list failed')
    }
}

const checkIsFriend = async ({ userId, friendId }) => {
    const userFriend = await Friend.findOne({ userId: toObjectId(userId) }).lean();
    const friendList = userFriend.friends;
    try {
        return friendList.some(friend => friend._id.equals(friendId))
    } catch (error) {
        throw new BadrequestError('Check is friend failed')
    }
}

const sendFriendRequest = async ({ userId, friendId }) => {
    if (userId === friendId) throw new BadrequestError('Can not send friend request to yourself');

    const friendExists = await User.exists({ _id: friendId })
    if (!friendExists) throw new BadrequestError('Friend not found')

    const isFriend = await checkIsFriend({ userId, friendId })
    if (isFriend) throw new BadrequestError('Already friend')

    const senderUpdateSet = {
        $addToSet: { 'friendsRequestSent': { recipientId: toObjectId(friendId) } }
    }
    const reciverUpdateSet = {
        $addToSet: { 'friendsRequestReceved': { senderId: toObjectId(userId) } }
    }

    const sender = await Friend.findOneAndUpdate(
        { userId: toObjectId(userId) },
        senderUpdateSet,
        { new: true }
    )

    await Friend.findOneAndUpdate(
        { userId: toObjectId(friendId) },
        reciverUpdateSet,
        { new: true }
    )

    const friendsRequestSent = await Promise.all(sender.friendsRequestSent.map(async (friend) => {
        const result = await User.findById(toObjectId(friend.recipientId))
        return {
            user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
            createdAt: friend.createdAt,
            updatedAt: friend.updatedAt
        };
    }))

    return friendsRequestSent ? friendsRequestSent : []
}

const getFriendsReceived = async (userId) => {
    try {
        const user = await Friend.findOne({ userId: toObjectId(userId) });
        const friendsReceived = await Promise.all(user.friendsRequestReceved.map(async (friend) => {
            const result = await User.findById(toObjectId(friend.senderId))
            return {
                user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                createdAt: friend.createdAt,
                updatedAt: friend.updatedAt
            };
        }))
        return friendsReceived ? friendsReceived : []
    } catch (error) {
        throw new BadrequestError('Get friends received failed')
    }
}

const getFriendForFriendPage = async ({ userId }) => {
    try {
        const friend = await Friend.findOne({ userId: toObjectId(userId) });

        const [friends, friendsRequestReceved, friendsRequestSent] = await Promise.all([
            Promise.all(friend.friends.map(async (friend) => {
                const result = await User.findById(toObjectId(friend.friendId))
                return {
                    user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                    createdAt: friend.createdAt,
                    updatedAt: friend.updatedAt
                };
            })),
            Promise.all(friend.friendsRequestReceved.map(async (friend) => {
                const result = await User.findById(toObjectId(friend.senderId))
                return {
                    user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                    createdAt: friend.createdAt,
                    updatedAt: friend.updatedAt
                };
            })),
            Promise.all(friend.friendsRequestSent.map(async (friend) => {
                const result = await User.findById(toObjectId(friend.recipientId))
                return {
                    user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                    createdAt: friend.createdAt,
                    updatedAt: friend.updatedAt
                };
            }))
        ]);


        return {
            friends,
            friendsRequestReceved,
            friendsRequestSent
        }
    } catch (error) {
        throw new BadrequestError('Get friends for friend page failed')
    }
}

const removeFriendRequest = async ({ userId, friendId }) => {
    try {
        const friendExists = await User.exists({ _id: friendId })
        if (!friendExists) throw new BadrequestError('Friend not found')

        const senderUpdateSet = {
            $pull: { 'friendsRequestSent': { recipientId: toObjectId(friendId) } }
        }
        const reciverUpdateSet = {
            $pull: { 'friendsRequestReceved': { senderId: toObjectId(userId) } }
        }

        const sender = await Friend.findOneAndUpdate(
            { userId: toObjectId(userId) },
            senderUpdateSet,
            { new: true }
        )

        await Friend.findOneAndUpdate(
            { userId: toObjectId(friendId) },
            reciverUpdateSet,
            { new: true }
        )

        const friendsRequestSent = await Promise.all(sender.friendsRequestSent.map(async (friend) => {
            const result = await User.findById(toObjectId(friend.recipientId))
            return {
                user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                createdAt: friend.createdAt,
                updatedAt: friend.updatedAt
            };
        }))

        return friendsRequestSent ? friendsRequestSent : [];
    } catch (error) {
        throw new BadrequestError('Remove friend request failed')
    }
}

const acceptFriendRequest = async ({ userId, friendId }) => {
    try {
        const friendExists = await User.exists({ _id: friendId })
        if (!friendExists) throw new BadrequestError('Friend not found')

        const userUpdateSet = {
            $addToSet: { 'friends': { friendId: toObjectId(friendId) } },
            $pull: { 'friendsRequestReceved': { senderId: toObjectId(friendId) } }
        }

        const friendUpdateSet = {
            $addToSet: { 'friends': { friendId: toObjectId(userId) } },
            $pull: { 'friendsRequestSent': { recipientId: toObjectId(userId) } }
        }

        const user = await Friend.findOneAndUpdate(
            { userId: toObjectId(userId) },
            userUpdateSet,
            { new: true }
        )

        await Friend.findOneAndUpdate(
            { userId: toObjectId(friendId) },
            friendUpdateSet,
            { new: true }
        )

        const friendsRequestReceved = await Promise.all(user.friendsRequestReceved.map(async (friend) => {
            const result = await User.findById(toObjectId(friend.senderId))
            return {
                user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                createdAt: friend.createdAt,
                updatedAt: friend.updatedAt
            };
        }))

        return friendsRequestReceved ? friendsRequestReceved : [];
    } catch (error) {
        throw new BadrequestError('Accept friend request failed')
    }
}

const rejectFriendRequest = async ({ userId, friendId }) => {
    try {
        const friendExists = await User.exists({ _id: friendId })
        if (!friendExists) throw new BadrequestError('Friend not found')

        const userUpdateSet = {
            $pull: { 'friendsRequestReceved': { senderId: toObjectId(friendId) } }
        }

        const friendUpdateSet = {
            $pull: { 'friendsRequestSent': { recipientId: toObjectId(userId) } }
        }

        const user = await Friend.findOneAndUpdate(
            { userId: toObjectId(userId) },
            userUpdateSet,
            { new: true }
        )

        await Friend.findOneAndUpdate(
            { userId: toObjectId(friendId) },
            friendUpdateSet,
            { new: true }
        )

        const friendsRequestReceved = await Promise.all(user.friendsRequestReceved.map(async (friend) => {
            const result = await User.findById(toObjectId(friend.senderId))
            return {
                user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                createdAt: friend.createdAt,
                updatedAt: friend.updatedAt
            };
        }))

        return friendsRequestReceved ? friendsRequestReceved : [];
    } catch (error) {
        throw new BadrequestError('Reject friend request failed')
    }
}

const getFriendForSocket = async (userId) => {
    try {
        const user = await User.findById(toObjectId(userId)).lean()
        return {
            user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: user }),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    } catch (error) {
        throw new Error('Get friend for socket failed')
    }
}

const unfriend = async ({ userId, friendId }) => {
    try {
        const friendExists = await User.exists({ _id: friendId })
        if (!friendExists) throw new BadrequestError('Friend not found')

        const userUpdateSet = {
            $pull: { 'friends': { friendId: toObjectId(friendId) } }
        }
        const friendUpdateSet = {
            $pull: { 'friends': { friendId: toObjectId(userId) } }
        }

        const user = await Friend.findOneAndUpdate(
            { userId: toObjectId(userId) },
            userUpdateSet,
            { new: true }
        )
        await Friend.findOneAndUpdate(
            { userId: toObjectId(friendId) },
            friendUpdateSet,
            { new: true }
        )
        const friends = await Promise.all(user.friends.map(async (friend) => {
            const result = await User.findById(toObjectId(friend.friendId))
            return {
                user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: result }),
                createdAt: friend.createdAt,
                updatedAt: friend.updatedAt
            };
        }))

        return friends ? friends : [];

    } catch (error) {
        throw new BadrequestError('Unfriend failed')
    }
}

module.exports = {
    getFriendListByUserId,
    checkIsFriend,
    unfriend,
    sendFriendRequest,
    removeFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendsReceived,
    getFriendForFriendPage,
    getFriendForSocket
};
