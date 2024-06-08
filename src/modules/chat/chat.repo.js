'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId } = require("../../common/utils/object.util");
const userModel = require("../user/user.model");
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
        console.log("🚀 ~ create ~ error:::", error);
        throw new BadrequestError('Create new Conversation failed')
    }
}

const get = async (userId, conversationId) => {
    try {
        const conversation = await Conversation.findOne({ _id: toObjectId(conversationId) }).populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'avatar _id name'
            }
        }).lean();
        if (conversation.type === 'private') {
            const messageTargetId = conversation.participants.find(participant => participant.user.toString() !== userId);
            const messageTarget = await userModel.findById(messageTargetId.user._id).select('name isOnline').lean();
            conversation.name = messageTarget.name;
            conversation.isOnline = messageTarget.isOnline;
        }
        return conversation;
    } catch (error) {
        throw new BadrequestError('Get conversation failed')
    }
}

const updateConversationName = async ({ conversationId, name }) => {
    try {
        const updatedConversation = await Conversation.findOneAndUpdate(
            { _id: toObjectId(conversationId) },
            { name },
            { new: true }
        )
        return !!updatedConversation;
    } catch (error) {
        throw new BadrequestError('Update conversation failed')
    }
}

const deleteConversationOnUserSide = async ({ conversationId, userId }) => {
    try {
        const deletedConversation = await Conversation.findOneAndUpdate(
            { _id: toObjectId(conversationId), 'participants.user': toObjectId(userId) },
            { $set: { 'participants.$[participant].isDeleted': true } },
            {
                arrayFilters: [{ 'participant.user': toObjectId(userId) }],
                new: true
            }
        )
        return !!deletedConversation;
    } catch (error) {
        throw new BadrequestError('Delete conversation failed')
    }
}

const getConversationHistory = async (conversationId) => {
    try {
        const conversation = await Conversation.findOne({ _id: toObjectId(conversationId) })
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'avatar _id name'
                },
                select: 'sender text messageAt'
            })
            .lean();

        if (!conversation) {
            throw new BadrequestError('Conversation not found');
        }

        return conversation.messages;
    } catch (error) {
        throw new BadrequestError('Get conversation history failed');
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
        const conversations = await Conversation.find({
            'participants': {
                $elemMatch: { user: userId, isDeleted: false }
            }
        })
            .populate({
                path: 'participants.user',
                model: 'User',
                select: 'name avatar isOnline'
            })
            .select('_id name imageUrl type participants')
            .exec();

        const privateConversations = [];
        const groupConversations = [];
        const aiConversations = [];

        conversations.forEach(conversation => {
            if (conversation.type === 'ai') {
                aiConversations.push({
                    _id: conversation._id,
                    name: 'Trợ lý ảo Wander',
                    imageUrl: conversation.imageUrl,
                    isOnline: true
                });
            } else if (conversation.type === 'private') {
                const participant = conversation.participants.find(p => p.user._id.toString() !== userId);
                privateConversations.push({
                    _id: conversation._id,
                    name: participant.user.name,
                    imageUrl: participant.user.avatar,
                    isOnline: participant.user.isOnline
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
        throw new Error('Failed to get conversations');
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
    updateMessageStatusToSeen,
    updateConversationName,
    deleteConversationOnUserSide,
    getConversationHistory
}
