const { toObjectId, getUnSelectData } = require('../../common/utils');
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

const isFriend = async ({ friendList, friendId }) => {
    try {
        return friendList.some(friend => friend._id.equals(friendId))
    } catch (error) {
        throw new Error('Check is friend failed')
    }
}

const sendFriendRequest = async ({ userId, friendId }) => {
    if (userId === friendId) throw new BadrequestError('Can not send friend request to yourself');

    const friendExists = await User.exists({ _id: friendId })
    if (!friendExists) throw new BadrequestError('Friend not found')

    const isFriend = await Friend.exists({
        friends: {
            $elemMatch: { friendId: friendId }
        }
    });
    if (isFriend) throw new BadrequestError('Already friend')

    const senderUpdateSet = {
        $addToSet: { 'friendsRequestSent': { recipientId: toObjectId(friendId) } }
    }
    const reciverUpdateSet = {
        $addToSet: { 'friendsRequestRecevied': { senderId: toObjectId(userId) } }
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

    return sender ? sender.friendsRequestSent : null;
}

const removeFriendRequest = async ({ userId, friendId }) => {
    try {
        const friendExists = await User.exists({ _id: friendId })
        if (!friendExists) throw new BadrequestError('Friend not found')

        const senderUpdateSet = {
            $pull: { 'friendsRequestSent': { recipientId: toObjectId(friendId) } }
        }
        const reciverUpdateSet = {
            $pull: { 'friendsRequestRecevied': { senderId: toObjectId(userId) } }
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

        return sender ? sender.friendsRequestSent : null;
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
            $pull: { 'friendsRequestRecevied': { senderId: toObjectId(friendId) } }
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

        return user ? user.friendsRequestRecevied : null;
    } catch (error) {
        throw new BadrequestError('Accept friend request failed')
    }
}

const rejectFriendRequest = async ({ userId, friendId }) => {
    try {
        const friendExists = await User.exists({ _id: friendId })
        if (!friendExists) throw new BadrequestError('Friend not found')

        const userUpdateSet = {
            $pull: { 'friendsRequestRecevied': { senderId: toObjectId(friendId) } }
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

        return user ? user.friendsRequestRecevied : null;
    } catch (error) {
        throw new BadrequestError('Reject friend request failed')
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

        return user ? user.friends : null;

    } catch (error) {
        throw new BadrequestError('Unfriend failed')
    }
}

module.exports = {
    getFriendListByUserId,
    isFriend,
    unfriend,
    sendFriendRequest,
    removeFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest
};
