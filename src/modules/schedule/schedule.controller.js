'use strict';

const { SuccessResponse } = require("../../common/core/success.response");
const ScheduleService = require("./schedule.service");

class ScheduleController {

    getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all schedule success',
            metadata: await ScheduleService.getAll({
                userId: req.user.userId,
                tab: req.query.tab
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

    getDetailSchedule = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get detail schedule success',
            metadata: await ScheduleService.getDetailSchedule(req.params.scheduleId, req.user.userId)
        }).send(res);
    }

    deleteSchedule = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete schedule success',
            metadata: await ScheduleService.deleteSchedule(req.body.scheduleId)
        }).send(res);
    }

    editPermission = async (req, res, next) => {
        new SuccessResponse({
            message: 'Edit permissions success',
            metadata: await ScheduleService.editPermission(req.body)
        }).send(res);
    }
}

module.exports = new ScheduleController();