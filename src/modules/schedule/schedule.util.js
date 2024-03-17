const Joi = require('joi');

const memberJoi = Joi.object({
    userId: Joi.string().required(),
    permission: Joi.string().valid('EDIT', 'VIEW').required()
});

const planJoi = Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    address: Joi.string().required(),
    googleMapId: Joi.string()
});

const createScheduleJoi = Joi.object({
    topic: Joi.string().trim().required(),
    description: Joi.string().trim(),
    ownerId: Joi.string().required(),
    plans: Joi.array().items(planJoi),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED'),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    isActive: Joi.boolean()
});

const updateScheduleJoi = Joi.object({
    ownerId: Joi.string().required(),
    topic: Joi.string().trim(),
    description: Joi.string().trim(),
    plans: Joi.array().items(planJoi),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    isActive: Joi.boolean()
});

module.exports = {
    planJoi,
    createScheduleJoi,
    updateScheduleJoi
};
