'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { getAllUsers, updateUser, statisticScheduleByMonth, statisticUserThisMonth, statisticScheduleThisMonth } = require("./admin.repo");

class AdminService {

    static async getAllUsers() {
        try {
            logger.info(
                `AdminService -> getAllUsers [START]\n(INPUT)`
            )
            const users = await getAllUsers()
            logger.info(
                `AdminService -> getAllUsers [END]\n(OUTPUT) ${handleObject({ users })
                }`
            )
            return users
        } catch (error) {
            throw new BadrequestError('Get all users failed');
        }
    }

    static updateUser = async (data) => {
        logger.info(
            `AdminService -> updateUser [START]\n(INPUT) ${handleObject({ data })}`
        )
        const user = await updateUser(data);
        logger.info(
            `AdminService -> updateUser [END]\n(OUTPUT) ${handleObject({ user })}`
        )
        return user;
    }

    static statisticScheduleByMonth = async () => {
        logger.info(
            `AdminService -> statisticScheduleByMonth [START]`
        )
        const statistic = await statisticScheduleByMonth();
        logger.info(
            `AdminService -> statisticScheduleByMonth [END]\n(OUTPUT) ${handleObject({ statistic })}`
        )
        return statistic
    }

    static statisticUserThisMonth = async () => {
        logger.info(
            `AdminService -> statisticUserThisMonth [START]`
        )
        const statistic = await statisticUserThisMonth();
        logger.info(
            `AdminService -> statisticUserThisMonth [END]\n(OUTPUT) ${handleObject({ statistic })}`
        )
        return statistic
    }

    static statisticScheduleThisMonth = async () => {
        logger.info(
            `AdminService -> statisticScheduleThisMonth [START]`
        )
        const statistic = await statisticScheduleThisMonth();
        logger.info(
            `AdminService -> statisticScheduleThisMonth [END]\n(OUTPUT) ${handleObject({ statistic })}`
        )
        return statistic
    }
}

module.exports = AdminService;
