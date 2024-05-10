'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const { authentication } = require('../../auth/auth-utils');
const ChatController = require('../../modules/chat/chat.controller');


/// AUTHENTICATION
router.use(authentication)

/// ---------------------------- Need check authen route ---------------------------- ///
router.post('/send-message/:conversationId', asyncHandler(ChatController.sendMessage));
router.get('/user-conversations', asyncHandler(ChatController.getUserConversations));
router.get('/:conversationId', asyncHandler(ChatController.get));
router.post('/group', asyncHandler(ChatController.createGroupChat));
router.post('', asyncHandler(ChatController.create));

module.exports = router;