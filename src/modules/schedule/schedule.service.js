'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { create, update, getAll, getById, getUserCalendar } = require("./schedule.repo");


class ScheduleService {

    static getAll = async ({ userId }) => {
        if (!userId) throw new BadrequestError('UserId is required');
        logger.info(
            `ScheduleService -> getAll [START]\n(INPUT) ${handleObject({ userId })
            }`
        )

        const schedules = await getAll(userId);
        logger.info(
            `ScheduleService -> getAll [END]\n(INPUT) ${handleObject({ schedules })
            }`
        )
        return schedules;
    }

    static getUserCalendar = async (userId) => {
        if (!userId) throw new BadrequestError('UserId is required');
        logger.info(
            `ScheduleService -> getUserCalendar [START]\n(INPUT) ${handleObject({ userId })
            }`
        )
        const calendars = await getUserCalendar(userId);
        logger.info(
            `ScheduleService -> getUserCalendar [END]\n(INPUT) ${handleObject({ calendars })
            }`
        )
        return calendars;
    }

    static getById = async (scheduleId) => {
        if (!scheduleId) throw new BadrequestError('ScheduleId is required');
        logger.info(
            `ScheduleService -> getById [START]\n(INPUT) ${handleObject({ scheduleId })
            }`
        )
        const schedule = await getById(scheduleId);
        logger.info(
            `ScheduleService -> getById [END]\n(OUTPUT) ${handleObject({ schedule })
            }`
        )
        return schedule;
    }

    static create = async ({ ownerId, topic, startDate, endDate, ...payload }) => {
        if (!ownerId) throw new BadrequestError('Owner is required');
        if (!topic) throw new BadrequestError('Topic is required');
        if (!startDate) throw new BadrequestError('Start Date is required');
        if (!endDate) throw new BadrequestError('End Date is required');

        logger.info(
            `ScheduleService -> create [START]\n(INPUT) ${handleObject({ ownerId, topic, startDate, endDate, ...payload })
            }`
        )

        const schedule = await create({ ownerId, topic, startDate, endDate, ...payload })
        if (!schedule) throw new BadrequestError('Create schedule failed');

        logger.info(
            `ScheduleService -> create [END]\n(OUTPUT) ${handleObject({ schedule })
            }`
        )
        return schedule;
    }

    static update = async ({ ownerId, ...payload }) => {
        if (!ownerId) throw new BadrequestError('Owner is required');

        logger.info(
            `ScheduleService -> update [START]\n(INPUT) ${handleObject({ ownerId, payload })
            }`
        )

        const schedule = await update({ ownerId, ...payload })
        if (!schedule) throw new BadrequestError('Update schedule failed');

        logger.info(
            `ScheduleService -> update [END]\n(OUTPUT) ${handleObject({ schedule })
            }`
        )
        return schedule;
    }
}

module.exports = ScheduleService;
