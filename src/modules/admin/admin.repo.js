'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId, getInfoData } = require("../../common/utils/object.util");
const { Schedule } = require("../schedule/schedule.model");
const userModel = require("../user/user.model");

const getAllUsers = async () => {
    try {
        const users = await userModel.find({}).lean();
        const formatUsers = users.map(user => {
            return getInfoData({ fields: ['avatar', 'name', '_id', 'email', 'isActive', 'role'], object: user })
        })
        return formatUsers
    } catch (error) {
        throw new BadrequestError('Get all users failed')
    }
}

const updateUser = async (data) => {
    try {
        const { _id, ...payload } = data
        const updatedUser = await userModel.findByIdAndUpdate(_id, payload, { new: true })
        return getInfoData({ fields: ['avatar', 'name', '_id', 'email', 'isActive', 'role'], object: updatedUser })
    } catch (error) {
        throw new BadrequestError('Update user failed')
    }
}
const statisticScheduleByMonth = async () => {
    try {
        const startDate = new Date('2024-01-01T00:00:00.000Z');
        const endDate = new Date('2024-12-31T23:59:59.999Z');

        const result = await Schedule.aggregate([
            {
                $match: {
                    startDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$startDate' },
                        month: { $month: '$startDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        const lookup = {};
        result.forEach(item => {
            lookup[item._id.month] = item.count;
        });

        const statistics = [];
        for (let month = 1; month <= 12; month++) {
            statistics.push({
                name: `Tháng ${month}`,
                total: lookup[month] || 0
            });
        }

        return statistics;
    } catch (error) {
        console.error("Error fetching schedule statistics:", error);
        throw new Error('Failed to retrieve schedule statistics');
    }
};

const statisticUserThisMonth = async () => {
    try {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [totalNewUserThisMonth, totalNewUserLastMonth] = await Promise.all([
            userModel.countDocuments({ createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth } }),
            userModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } })
        ]);

        return {
            thisMonth: totalNewUserThisMonth,
            lastMonth: totalNewUserLastMonth,
            diff: Math.max(totalNewUserThisMonth - totalNewUserLastMonth, 0)
        };
    } catch (error) {
        console.error("Failed to retrieve user statistics:", error);
        throw new Error('Failed to retrieve user statistics');
    }
};

const statisticScheduleThisMonth = async () => {
    try {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [totalScheduleThisMonth, totalScheduleLastMonth] = await Promise.all([
            Schedule.countDocuments({ startDate: { $gte: startOfThisMonth, $lte: endOfThisMonth } }),
            Schedule.countDocuments({ startDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } })
        ]);

        return {
            thisMonth: totalScheduleThisMonth,
            lastMonth: totalScheduleLastMonth,
            diff: Math.max(totalScheduleThisMonth - totalScheduleLastMonth, 0)
        };
    } catch (error) {
        console.error("Failed to retrieve schedule statistics:", error);
        throw new Error('Failed to retrieve schedule statistics');
    }
};



module.exports = {
    getAllUsers,
    updateUser,
    statisticScheduleByMonth,
    statisticUserThisMonth,
    statisticScheduleThisMonth
}
