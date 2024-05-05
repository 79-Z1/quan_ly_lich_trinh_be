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
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

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

        const statistics = [];
        for (let month = 1; month <= 12; month++) {
            const monthData = result.find(item => item._id.month === month);
            statistics.push({
                name: `Tháng ${month}`,
                total: monthData ? monthData.count : 0
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
        const totalNewUserThisMonth = await userModel.countDocuments({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }
        });
        const totalNewUserLastMonth = await userModel.countDocuments({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                $lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
            }
        });
        return {
            thisMonth: totalNewUserThisMonth,
            lastMonth: totalNewUserLastMonth,
            diff: totalNewUserThisMonth - totalNewUserLastMonth > 0 ? totalNewUserThisMonth - totalNewUserLastMonth : 0
        }
    } catch (error) {
        throw new Error('Failed to retrieve user statistics');
    }
}

const statisticScheduleThisMonth = async () => {
    try {
        const totalScheduleThisMonth = await Schedule.countDocuments({
            startDate: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }
        });
        const totalScheduleLastMonth = await Schedule.countDocuments({
            startDate: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                $lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
            }
        });
        return {
            thisMonth: totalScheduleThisMonth,
            lastMonth: totalScheduleLastMonth,
            diff: totalScheduleThisMonth - totalScheduleLastMonth > 0 ? totalScheduleThisMonth - totalScheduleLastMonth : 0
        }
    } catch (error) {
        throw new Error('Failed to retrieve schedule statistics');
    }
}



module.exports = {
    getAllUsers,
    updateUser,
    statisticScheduleByMonth,
    statisticUserThisMonth,
    statisticScheduleThisMonth
}
