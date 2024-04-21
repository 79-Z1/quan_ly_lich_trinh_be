const Joi = require('joi');

const memberJoi = Joi.object({
    memberId: Joi.string().required(),
    permission: Joi.string().valid('edit', 'view').default('view'),
    isActive: Joi.boolean()
});

const planJoi = Joi.object({
    title: Joi.string().required(),
    cost: Joi.number(),
    startAt: Joi.date().required(),
    address: Joi.string().required(),
    location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    })
});

const createScheduleJoi = Joi.object({
    topic: Joi.string().trim().required(),
    description: Joi.string().trim(),
    ownerId: Joi.string().required(),
    imageUrl: Joi.string().trim().allow(''),
    plans: Joi.array().items(planJoi),
    members: Joi.array().items(memberJoi),
    status: Joi.string().valid('pending', 'in_progress', 'completed'),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    total: Joi.number(),
    isActive: Joi.boolean()
});

const updateScheduleJoi = Joi.object({
    ownerId: Joi.string().required(),
    topic: Joi.string().trim(),
    description: Joi.string().trim(),
    plans: Joi.array().items(planJoi),
    members: Joi.array().items(memberJoi),
    status: Joi.string().valid('pending', 'in_progress', 'completed'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    isActive: Joi.boolean()
});

module.exports = {
    planJoi,
    createScheduleJoi,
    updateScheduleJoi
};
