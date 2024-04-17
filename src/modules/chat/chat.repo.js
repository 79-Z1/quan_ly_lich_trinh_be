'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId } = require("../../common/utils/object.util");
const { findUserById } = require("../user/user.repo");
const { conversationJoi, messageJoi } = require("./chat.validate");
const Conversation = require("./conversation/conversation.model");

const create = async (conversation) => {
    try {
        const { error, value } = conversationJoi.validate(conversation);
        if (error) {
            throw new BadrequestError(error.message);
        }

        const newConversation = await Conversation.create(value);
        return newConversation;
    } catch (error) {
        throw new BadrequestError('Create new Conversation failed')
    }
}

const get = async (conversationId) => {
    try {
        const conversation = await Conversation.findOne({ _id: toObjectId(conversationId) });
        return conversation;
    } catch (error) {
        throw new BadrequestError('Get conversation failed')
    }
}

const getUserConversations = async (userId) => {
    try {
        const privateConversations = await Conversation.find({ 'participants.userId': userId, type: 'private' }).select('participants').lean();
        const formatPrivateConversations = await Promise.all(privateConversations.map(async (conversation) => {
            const friendId = conversation.participants.filter(p => p.userId !== userId)[0].userId;
            const friend = await findUserById(friendId);
            return {
                _id: conversation._id,
                name: friend.name,
                image: friend.avatar
            }
        }));

        const groupConversations = await Conversation.find({ 'participants.userId': userId, type: 'group' }).select('participants').lean();
        const formatGroupConversations = await Promise.all(groupConversations.map(async (conversation) => {
            return {
                _id: conversation._id,
                name: conversation.name,
                image: conversation.image
            }
        }));

        return {
            privateConversations: formatPrivateConversations,
            groupConversations: formatGroupConversations
        }
    } catch (error) {
        throw new BadrequestError('Get conversation failed')
    }
}

const sendMessage = async ({ conversationId, newMessage }) => {
    try {
        const { error, value } = messageJoi.validate(newMessage);
        if (error) {
            throw new BadrequestError(error.message);
        }
        const newMessageUpdateSet = {
            $addToSet: { 'messages': { ...value } }
        }

        const conversation = await Conversation.findOneAndUpdate(
            { _id: toObjectId(conversationId) },
            newMessageUpdateSet,
            { new: true }
        )
        return conversation;
    } catch (error) {
        throw new BadrequestError('Send message failed')
    }
}

module.exports = {
    get,
    create,
    sendMessage,
    getUserConversations
}
