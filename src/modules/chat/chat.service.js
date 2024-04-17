'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const chatRepo = require("./chat.repo");

class ChatService {

    static create = async ({ creatorId, participants, ...payload }) => {
        if (!creatorId) throw new BadrequestError('CreatorId is required');
        if (!participants) throw new BadrequestError('Participants is required');

        logger.info(
            `ChatService -> create [START]\n(INPUT) ${handleObject({ creatorId, participants, ...payload })
            }`
        )

        const newChat = await chatRepo.create({ creatorId, participants, ...payload })

        logger.info(
            `ChatService -> create [END]\n(OUTPUT) ${handleObject({ newChat })
            }`
        )
        return newChat;
    }

    static get = async ({ conversationId }) => {
        if (!conversationId) throw new BadrequestError('ConversationId is required');

        logger.info(
            `ChatService -> get [START]\n(INPUT) ${handleObject({ conversationId })
            }`
        )

        const conversation = await chatRepo.get(conversationId);
        return conversation;
    }

    static getUserConversations = async (userId) => {
        if (!userId) throw new BadrequestError('UserId is required');

        logger.info(
            `ChatService -> get [START]\n(INPUT) ${handleObject({ userId })
            }`
        )

        const conversationClassified = await chatRepo.getUserConversations(userId);
        return conversationClassified;
    }

    static sendMessage = async ({ conversationId, newMessage }) => {
        if (!conversationId) throw new BadrequestError('conversationId is required');
        if (!newMessage) throw new BadrequestError('NewMessage is required');

        logger.info(
            `ChatService -> sendMessage [START]\n(INPUT) ${handleObject({ conversationId, newMessage })
            }`
        )

        const conversation = await chatRepo.sendMessage({ conversationId, newMessage });
        return conversation;
    }
}

module.exports = ChatService;
