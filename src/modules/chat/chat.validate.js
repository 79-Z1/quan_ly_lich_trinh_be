const Joi = require('joi');

const participantJoi = Joi.object({
    user: Joi.required(),
    status: Joi.string().valid('blocked', 'normal').default('normal')
});

const messageJoi = Joi.object({
    sender: Joi.string().required(),
    text: Joi.string().required(),
    pinned: Joi.boolean().default(false),
    reactions: Joi.array().items(Joi.object({
        reacter: Joi.string().required(),
        emotion: Joi.string().valid('like', 'love', 'sad', 'angry', 'happy').default('')
    })),
    isActive: Joi.boolean().default(true),
    messageAt: Joi.date().default(Date.now)
});

const conversationJoi = Joi.object({
    _id: Joi.optional(),
    creatorId: Joi.required(),
    name: Joi.string().optional(),
    participants: Joi.array().items(participantJoi).default([]),
    isActive: Joi.boolean().default(true),
    messages: Joi.array().items(messageJoi).default([]),
    type: Joi.string().valid('private', 'group', 'ai').default('private'),
    imageUrl: Joi.string().optional()
});

module.exports = {
    conversationJoi,
    messageJoi
};