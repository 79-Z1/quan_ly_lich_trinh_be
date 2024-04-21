'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const { authentication } = require('../../auth/auth-utils');
const friendController = require('../../modules/friend/friend.controller');


/// AUTHENTICATION
router.use(authentication)

/// ---------------------------- Need check authen route ---------------------------- ///
router.patch('/send-request', asyncHandler(friendController.sendFriendRequest));
router.patch('/remove-request', asyncHandler(friendController.removeFriendRequest));
router.patch('/accept', asyncHandler(friendController.acceptFriendRequest));
router.patch('/reject', asyncHandler(friendController.rejectFriendRequest));
router.patch('/unfriend', asyncHandler(friendController.unfriend));
router.get('/friend-list', asyncHandler(friendController.getFriendListByUserId));
router.get('', asyncHandler(friendController.getFriendForFriendPage));

module.exports = router;