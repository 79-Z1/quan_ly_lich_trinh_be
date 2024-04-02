'use strict';

const { SuccessResponse } = require("../../common/core/success.response");
const FriendService = require("./friend.service");

class FriendController {

    getFriendListByUserId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get friend list success',
            metadata: await FriendService.getFriendListByUserId(req.user.userId)
        }).send(res);
    }

    getFriendForFriendPage = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get friend for friend page success',
            metadata: await FriendService.getFriendForFriendPage({
                userId: req.user.userId,
                tab: req.query.tab
            })
        }).send(res);
    }

    sendFriendRequest = async (req, res, next) => {
        new SuccessResponse({
            message: 'Send friend request success',
            metadata: await FriendService.sendFriendRequest({
                userId: req.user.userId,
                friendId: req.body.friendId
            })
        }).send(res);
    }

    removeFriendRequest = async (req, res, next) => {
        new SuccessResponse({
            message: 'Remove friend request success',
            metadata: await FriendService.removeFriendRequest({
                userId: req.user.userId,
                friendId: req.body.friendId
            })
        }).send(res);
    }

    acceptFriendRequest = async (req, res, next) => {
        new SuccessResponse({
            message: 'Accept friend request success',
            metadata: await FriendService.acceptFriendRequest({
                userId: req.user.userId,
                friendId: req.body.friendId
            })
        }).send(res);
    }

    rejectFriendRequest = async (req, res, next) => {
        new SuccessResponse({
            message: 'Reject friend request success',
            metadata: await FriendService.rejectFriendRequest({
                userId: req.user.userId,
                friendId: req.body.friendId
            })
        }).send(res);
    }

    unfriend = async (req, res, next) => {
        new SuccessResponse({
            message: 'Unfriend friend success',
            metadata: await FriendService.unfriend({
                userId: req.user.userId,
                friendId: req.body.friendId
            })
        }).send(res);
    }
}

module.exports = new FriendController();