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
        console.log("🚀 ~ create ~ error:::", error);
        throw new BadrequestError('Create new Conversation failed')
    }
}

const get = async (conversationId) => {
    try {
        const conversation = await Conversation.findOne({ _id: toObjectId(conversationId) });
        return conversation;
    } catch (error) {
        console.log("🚀 ~ get ~ error:::", error);
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
        console.log("🚀 ~ create ~ error:::", error);
        throw new BadrequestError('Send message failed')
    }
}

module.exports = {
    get,
    create,
    sendMessage
}
