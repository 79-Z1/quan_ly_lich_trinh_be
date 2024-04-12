'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { sendFriendRequest, removeFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriend, getFriendListByUserId, getFriendForFriendPage } = require("./friend.repo");


class FriendService {

    static getFriendListByUserId = async (userId) => {
        if (!userId) throw new BadrequestError('UserId is required');
        logger.info(
            `FriendService -> getFriendListByUserId [START]\n(INPUT) ${handleObject({ userId })
            }`
        )

        const friends = await getFriendListByUserId(userId)
        if (!friends) throw new BadrequestError('Get friend list failed');
        if (friends.length <= 0) return [];

        logger.info(
            `FriendService -> getFriendListByUserId [END]\n(OUTPUT) ${handleObject({ friends })
            }`
        )
        return friends;
    }

    static getFriendForFriendPage = async ({ userId }) => {
        if (!userId) throw new BadrequestError('UserId is required');
        logger.info(
            `FriendService -> getFriendForFriendPage [START]\n(INPUT) ${handleObject({ userId })
            }`
        )

        const result = await getFriendForFriendPage({ userId })

        logger.info(
            `FriendService -> getFriendForFriendPage [END]\n(OUTPUT) ${handleObject({ result })
            }`
        )
        return result;
    }

    static sendFriendRequest = async ({ userId, friendId }) => {
        if (!userId) throw new BadrequestError('UserId is required');
        if (!friendId) throw new BadrequestError('FriendId is required');
        logger.info(
            `FriendService -> sendFriendRequest [START]\n(INPUT) ${handleObject({ userId, friendId })
            }`
        )

        if (userId === friendId) throw new BadrequestError('Can not send friend request to yourself');

        const friendsRequestSent = await sendFriendRequest({ userId, friendId })
        if (!friendsRequestSent) throw new BadrequestError('Send friend request failed');

        logger.info(
            `FriendService -> sendFriendRequest [END]\n(OUTPUT) ${handleObject({ friendsRequestSent })
            }`
        )
        return friendsRequestSent;
    }

    static removeFriendRequest = async ({ userId, friendId }) => {
        if (!userId) throw new BadrequestError('UserId is required');
        if (!friendId) throw new BadrequestError('FriendId is required');
        logger.info(
            `FriendService -> removeFriendRequest [START]\n(INPUT) ${handleObject({ userId, friendId })
            }`
        )

        if (userId === friendId) throw new BadrequestError('Can not remove friend request to yourself');

        const friendsRequestSent = await removeFriendRequest({ userId, friendId })
        if (!friendsRequestSent) throw new BadrequestError('Remove friend request failed');

        logger.info(
            `FriendService -> removeFriendRequest [END]\n(OUTPUT) ${handleObject({ friendsRequestSent })
            }`
        )
        return friendsRequestSent;
    }

    static acceptFriendRequest = async ({ userId, friendId }) => {
        if (!userId) throw new BadrequestError('UserId is required');
        if (!friendId) throw new BadrequestError('FriendId is required');
        logger.info(
            `FriendService -> acceptFriendRequest [START]\n(INPUT) ${handleObject({ userId, friendId })
            }`
        )

        if (userId === friendId) throw new BadrequestError('Can not accept friend request to yourself');

        const friendsRequestReceved = await acceptFriendRequest({ userId, friendId })
        if (!friendsRequestReceved) throw new BadrequestError('Accept friend request failed');

        logger.info(
            `FriendService -> acceptFriendRequest [END]\n(OUTPUT) ${handleObject({ friendsRequestReceved })
            }`
        )
        return friendsRequestReceved;
    }

    static rejectFriendRequest = async ({ userId, friendId }) => {
        if (!userId) throw new BadrequestError('UserId is required');
        if (!friendId) throw new BadrequestError('FriendId is required');
        logger.info(
            `FriendService -> rejectFriendRequest [START]\n(INPUT) ${handleObject({ userId, friendId })
            }`
        )

        if (userId === friendId) throw new BadrequestError('Can not reject friend request to yourself');

        const friendsRequestReceved = await rejectFriendRequest({ userId, friendId })
        if (!friendsRequestReceved) throw new BadrequestError('Reject friend request failed');

        logger.info(
            `FriendService -> rejectFriendRequest [END]\n(OUTPUT) ${handleObject({ friendsRequestReceved })
            }`
        )
        return friendsRequestReceved;
    }

    static unfriend = async ({ userId, friendId }) => {
        if (!userId) throw new BadrequestError('UserId is required');
        if (!friendId) throw new BadrequestError('FriendId is required');
        logger.info(
            `FriendService -> unfriend [START]\n(INPUT) ${handleObject({ userId })
            }`
        )

        if (userId === friendId) throw new BadrequestError('Can not unfriend yourself');

        const friends = await unfriend({ userId, friendId })
        if (!friends) throw new BadrequestError('Unfriend failed');

        logger.info(
            `FriendService -> unfriend [END]\n(OUTPUT) ${handleObject({ friends })
            }`
        )
        return friends;
    }
}

module.exports = FriendService;
