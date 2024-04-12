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

    sendMessage = async (req, res) => {
        new SuccessResponse({
            message: 'Send message success',
            metadata: await ChatService.sendMessage({
                conversationId: req.params.conversationId,
                newMessage: req.body
            })
        }).send(res);
    }

}

module.exports = new ChatController();