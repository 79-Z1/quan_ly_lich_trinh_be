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
    const currentYear = new Date().getFullYear();
    // first day of the year
    const startDate = new Date(currentYear, 0, 1);
    // end day of the year
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    try {
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

        // Chuyển đổi kết quả thành một đối tượng lookup
        const lookup = result.reduce((acc, item) => {
            acc[item._id.month] = item.count;
            return acc;
        }, {});

        // Tạo thống kê cho mỗi tháng
        return Array.from({ length: 12 }, (_, index) => ({
            name: `Tháng ${index + 1}`,
            total: lookup[index + 1] || 0
        }));
    } catch (error) {
        console.error("Error fetching schedule statistics:", error);
        throw new Error('Failed to retrieve schedule statistics');
    }
};

const getMonthlyStatistics = async (model, dateField) => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
        const [totalThisMonth, totalLastMonth] = await Promise.all([
            model.countDocuments({ [dateField]: { $gte: startOfThisMonth, $lte: endOfThisMonth } }),
            model.countDocuments({ [dateField]: { $gte: startOfLastMonth, $lte: endOfLastMonth } })
        ]);

        return {
            thisMonth: totalThisMonth,
            lastMonth: totalLastMonth,
            diff: Math.max(totalThisMonth - totalLastMonth, 0)
        };
    } catch (error) {
        console.error(`Failed to retrieve statistics for model ${model.modelName}:`, error);
        throw new Error('Failed to retrieve statistics');
    }
};

const statisticUserThisMonth = async () => {
    return getMonthlyStatistics(userModel, 'createdAt');
};

const statisticScheduleThisMonth = async () => {
    return getMonthlyStatistics(Schedule, 'startDate');
};

const getRankingList = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const scheduleRank = await Schedule.aggregate([
            {
                $match: {
                    status: 'completed', // Filter for completed schedules
                    startDate: { $gte: startOfMonth, $lte: endOfMonth } // Filter for the current month
                }
            },
            {
                $group: {
                    _id: '$user',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10 // Limit the results to the top 10
            },
            {
                $lookup: {
                    from: 'users', // The name of the user collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    name: '$user.name',
                    email: '$user.email',
                    avatar: '$user.avatar',
                    count: 1
                }
            }
        ]);

        return scheduleRank;
    } catch (error) {
        console.error("Get ranking list failed:", error);
        throw new BadrequestError('Get ranking list failed');
    }
};

module.exports = {
    getAllUsers,
    updateUser,
    statisticScheduleByMonth,
    statisticUserThisMonth,
    statisticScheduleThisMonth,
    getRankingList
}
