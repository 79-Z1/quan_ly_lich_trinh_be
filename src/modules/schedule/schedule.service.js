'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { create, update, getAll } = require("./schedule.repo");


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
