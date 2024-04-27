'use strict';

const { SuccessResponse } = require("../../common/core/success.response");
const ScheduleService = require("./schedule.service");

class ScheduleController {

    getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all schedule success',
            metadata: await ScheduleService.getAll({
                userId: req.user.userId
            })
        }).send(res);
    }

    getUserCalendar = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get user calendar success',
            metadata: await ScheduleService.getUserCalendar(req.user.userId)
        }).send(res);
    }

    create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create schedule success',
            metadata: await ScheduleService.create({
                ownerId: req.user.userId,
                ...req.body
            })
        }).send(res);
    }

    update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update schedule success',
            metadata: await ScheduleService.update({
                ownerId: req.user.userId,
                ...req.body
            })
        }).send(res);
    }

    getById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get schedule by id success',
            metadata: await ScheduleService.getById(req.params.scheduleId)
        }).send(res);
    }
}

module.exports = new ScheduleController();