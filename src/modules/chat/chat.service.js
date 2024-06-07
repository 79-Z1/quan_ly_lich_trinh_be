'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { toObjectId } = require("../../common/utils/object.util");
const { Schedule } = require("../schedule/schedule.model");
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

    static createGroupChat = async ({ creatorId, name, scheduleId }) => {
        if (!creatorId) throw new BadrequestError('CreatorId is required');
        if (!name) throw new BadrequestError('Name is required');
        if (!scheduleId) throw new BadrequestError('scheduleId is required');

        logger.info(
            `ChatService -> createGroupChat [START]\n(INPUT) ${handleObject({ creatorId, name, scheduleId })
            }`
        )

        const schedule = await Schedule.findById(scheduleId).lean();
        if (schedule?.members.length < 1) {
            throw new BadrequestError('Group chat must at least 2 participants')
        }

        const formatParticipants = [];
        formatParticipants.push({ user: toObjectId(creatorId) });
        schedule.members.map(member => {
            formatParticipants.push({ user: member.memberId })
        });

        const newConversation = await chatRepo.createGroupChat({ _id: schedule._id, creatorId, name, participants: formatParticipants, type: 'group' })

        logger.info(
            `ChatService -> createGroupChat [END]\n(OUTPUT) ${handleObject({ newConversation })
            }`
        )
        return newConversation;
    }

    static get = async ({ conversationId, userId }) => {
        if (!conversationId) throw new BadrequestError('ConversationId is required');

        logger.info(
            `ChatService -> get [START]\n(INPUT) ${handleObject({ conversationId, userId })
            }`
        )

        const conversation = await chatRepo.get(userId, conversationId);
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

    static updateMessageStatusToSeen = async (conversationId, messageIds) => {
        if (!conversationId) throw new BadrequestError('conversationId is required');
        if (!messageIds) throw new BadrequestError('MessageIds is required');

        logger.info(
            `ChatService -> updateMessageStatusToSeen [START]\n(INPUT) ${handleObject({ conversationId, messageIds })
            }`
        )
        const conversation = await chatRepo.updateMessageStatusToSeen({ conversationId, messageIds });
        return conversation;
    }

    static updateConversationName = async ({ conversationId, name }) => {
        if (!conversationId) throw new BadrequestError('conversationId is required');
        if (!name) throw new BadrequestError('Name is required');

        logger.info(
            `ChatService -> updateConversationName [START]\n(INPUT) ${handleObject({ conversationId, name })
            }`
        )
        const status = await chatRepo.updateConversationName({ conversationId, name });
        return status;
    }

    static deleteConversationOnUserSide = async ({ conversationId, userId }) => {
        if (!conversationId) throw new BadrequestError('conversationId is required');
        if (!userId) throw new BadrequestError('userId is required');

        logger.info(
            `ChatService -> deleteConversationOnUserSide [START]\n(INPUT) ${handleObject({ conversationId, userId })
            }`
        )
        const status = await chatRepo.deleteConversationOnUserSide({ conversationId, userId });
        return status;
    }
}

module.exports = ChatService;
