'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const chatRepo = require("./chat.repo");

class ChatService {

    static create = async ({ creatorId, participants, name, ...payload }) => {
        if (!creatorId) throw new BadrequestError('CreatorId is required');
        if (!participants) throw new BadrequestError('Participants is required');
        if (!name) throw new BadrequestError('Name is required');

        logger.info(
            `ChatService -> create [START]\n(INPUT) ${handleObject({ creatorId, participants, name, ...payload })
            }`
        )

        const newChat = await chatRepo.create({ creatorId, participants, name, ...payload })

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
