'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId } = require("../../common/utils/object.util");
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
        const conversation = await Conversation.findOne({ _id: toObjectId(conversationId) }).populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'avatar _id name'
            }
        }).lean();
        return conversation;
    } catch (error) {
        throw new BadrequestError('Get conversation failed')
    }
}

const getMessages = async (conversationId) => {
    try {
        const conversation = await Conversation.findOne({ _id: toObjectId(conversationId) }).populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'avatar _id name'
            }
        }).lean();
        return conversation.messages;
    } catch (error) {
        throw new BadrequestError('Get conversation failed')
    }
}

const getUserConversations = async (userId) => {
    try {
        // Find both private and group conversations in a single query and populate participants
        const conversations = await Conversation.find({ 'participants.user': userId })
            .populate({
                path: 'participants.user',
                model: 'User',
                select: 'name avatar'
            })
            .select('_id name imageUrl type participants')
            .lean();

        // Separate private and group conversations
        const privateConversations = [];
        const groupConversations = [];
        const aiConversations = [];
        conversations.forEach(conversation => {

            if (conversation.type === 'ai') {
                aiConversations.push({
                    _id: conversation._id,
                    name: conversation.name,
                    imageUrl: conversation.imageUrl
                });
            } else if (conversation.type === 'private') {
                const participant = conversation.participants.find(p => p.user._id.toString() !== userId);
                privateConversations.push({
                    _id: conversation._id,
                    name: participant.user.name,
                    imageUrl: participant.user.avatar
                });
            } else {
                groupConversations.push({
                    _id: conversation._id,
                    name: conversation.name,
                    imageUrl: conversation.imageUrl
                });
            }
        });

        return { privateConversations, groupConversations, aiConversations };
    } catch (error) {
        throw new BadrequestError('Failed to get conversations');
    }
}

const sendMessage = async ({ conversationId, newMessage }) => {
    try {
        const { error, value } = messageJoi.validate(newMessage);
        if (error) {
            throw new BadrequestError(error.message);
        }

        const updatedConversation = await Conversation.findOneAndUpdate(
            { _id: toObjectId(conversationId) },
            { $addToSet: { messages: value } },
            { new: true }
        ).populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'avatar _id name'
            }
        }).lean();

        return updatedConversation.messages;
    } catch (error) {
        throw new BadrequestError('Send message failed')
    }
}

const findConversationByParticipants = async (userId1, userId2) => {
    try {
        const conversation = await Conversation.findOne({
            $and: [
                { 'participants.user': userId1 },
                { 'participants.user': userId2 },
                { 'type': 'private' }
            ]
        });
        return conversation;
    } catch (error) {
        throw new BadrequestError('Find conversation by participants failed');
    }
}

const createGroupChat = async (conversation) => {
    try {
        const { error, value } = conversationJoi.validate(conversation);
        if (error) {
            throw new BadrequestError(error.message);
        }
        const newConversation = await Conversation.create(value);
        return newConversation;
    } catch (error) {
        throw new BadrequestError('Create new Group Chat failed')
    }
}

const updateMessageStatusToSeen = async (conversationId, messageIds) => {
    try {
        const updatedConversation = await Conversation.findOneAndUpdate(
            {
                _id: toObjectId(conversationId),
                'messages._id': { $in: messageIds }
            },
            { $set: { 'messages.$[message].seen': true } },
            {
                arrayFilters: [{ 'message._id': { $in: messageIds } }],
                new: true
            }
        ).populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'avatar _id name'
            }
        }).lean();

        return updatedConversation.messages;
    } catch (error) {
        throw new BadrequestError('Update message status to seen failed');
    }
}

module.exports = {
    get,
    create,
    sendMessage,
    getUserConversations,
    findConversationByParticipants,
    createGroupChat,
    getMessages,
    updateMessageStatusToSeen
}
