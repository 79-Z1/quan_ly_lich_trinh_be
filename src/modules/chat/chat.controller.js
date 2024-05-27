'use strict';

const { SuccessResponse } = require("../../common/core/success.response");
const ChatService = require("./chat.service");

class ChatController {

    create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create chat success',
            metadata: await ChatService.create({
                creatorId: req.user.userId,
                ...req.body
            })
        }).send(res);
    }

    get = async (req, res) => {
        new SuccessResponse({
            message: 'Get chat by id success',
            metadata: await ChatService.get({
                conversationId: req.params.conversationId
            })
        }).send(res);
    }

    getUserConversations = async (req, res) => {
        new SuccessResponse({
            message: 'Get user conversations success',
            metadata: await ChatService.getUserConversations(req.user.userId)
        }).send(res);
    }

    sendMessage = async (req, res) => {
        new SuccessResponse({
            message: 'Send message success',
            metadata: await ChatService.sendMessage({
                conversationId: req.params.conversationId,
                newMessage: req.body
            })
        }).send(res);
    }

    createGroupChat = async (req, res) => {
        new SuccessResponse({
            message: 'Create group chat success',
            metadata: await ChatService.createGroupChat({
                creatorId: req.user.userId,
                ...req.body
            })
        }).send(res);
    }

    updateConversationName = async (req, res) => {
        new SuccessResponse({
            message: 'Update conversation name success',
            metadata: await ChatService.updateConversationName({
                conversationId: req.body.conversationId,
                name: req.body.name
            })
        }).send(res);
    }

    deleteConversationOnUserSide = async (req, res) => {
        new SuccessResponse({
            message: 'Delete conversation on user side success',
            metadata: await ChatService.deleteConversationOnUserSide({
                conversationId: req.body.conversationId,
                userId: req.user.userId
            })
        }).send(res);
    }

}

module.exports = new ChatController();