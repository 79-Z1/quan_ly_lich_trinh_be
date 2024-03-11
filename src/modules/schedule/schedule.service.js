'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { create, update } = require("./schedule.repo");


class ScheduleService {

    static create = async ({ ownerId, topic, startDate, endDate, ...payload }) => {
        if (!ownerId) throw new BadrequestError('Owner is required');
        if (!topic) throw new BadrequestError('Topic is required');
        if (!startDate) throw new BadrequestError('Start Date is required');
        if (!endDate) throw new BadrequestError('End Date is required');

        logger.info(
            `ScheduleService -> create [START]\n(INPUT) ${handleObject({ ownerId, topic, startDate, endDate, payload })
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
