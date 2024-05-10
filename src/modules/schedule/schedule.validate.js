const Joi = require('joi');

const memberJoi = Joi.object({
    memberId: Joi.string().required(),
    permission: Joi.string().valid('edit', 'view').default('view'),
    isActive: Joi.boolean()
});

const planJoi = Joi.object({
    _id: Joi.string(),
    title: Joi.string().required(),
    imageUrl: Joi.string().trim().allow(''),
    cost: Joi.number(),
    startAt: Joi.date().required(),
    endAt: Joi.date().required(),
    address: Joi.string().required(),
    location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    }),
    isActive: Joi.boolean().optional()
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
    topic: Joi.string().trim().optional(),
    imageUrl: Joi.string().trim().allow(''),
    description: Joi.string().trim().optional(),
    plans: Joi.array().items(planJoi).optional(),
    total: Joi.number().optional(),
    members: Joi.array().items(memberJoi).optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    isActive: Joi.boolean().optional()
});

module.exports = {
    planJoi,
    createScheduleJoi,
    updateScheduleJoi
};
