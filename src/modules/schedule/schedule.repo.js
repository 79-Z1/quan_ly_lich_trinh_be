const { BadrequestError } = require('../../common/core/error.response');
const { Schedule, Member } = require('./schedule.model');
const { createScheduleJoi, updateScheduleJoi } = require('./schedule.validate.js');
const { compareDays, ltOrEqDays, getStatusByTime, isLessThanDays, isGreaterThanDays, formatVNDate, getStatusByTime2 } = require('../../common/utils/date.util');
const User = require('../user/user.model.js');
const { toObjectId, getUnSelectData } = require('../../common/utils/object.util.js');
const { getUserSettings } = require('../user/user.repo.js');
const { orderBy } = require('lodash');
const conversationModel = require('../chat/conversation/conversation.model.js');
const { scheduleJob } = require('../node-schedule/scheduleJob.js');


const getAll = async (userId, tab) => {
    try {
        const baseQuery = {
            isActive: true,
            $or: [
                { ownerId: userId },
                { 'members.memberId': userId }
            ]
        };

        switch (tab) {
            case 'upcoming':
                baseQuery.status = 'pending';
                break;
            case 'completed':
                baseQuery.status = 'completed';
                break;
            case 'in_progress':
                baseQuery.status = 'in_progress';
                break;
        }

        const [schedules, groupChats] = await Promise.all([
            Schedule.find(baseQuery)
                .populate({
                    path: 'members.memberId',
                    select: 'name email avatar'
                })
                .select('topic imageUrl ownerId members startDate endDate')
                .lean(),
            conversationModel.find({ type: 'group' }).select('_id').lean()
        ]);

        const groupChatIds = new Set(groupChats.map(chat => chat._id.toString()));

        const formattedSchedules = schedules.map(schedule => {
            const isExistGroupChat = groupChatIds.has(schedule._id.toString());
            const formattedMembers = schedule.members.map(member => ({
                ...member.memberId,
                permission: member.permission,
                isActive: member.isActive
            }));
            const isOwner = schedule.ownerId.toString() === userId;
            schedule.members = formattedMembers;
            schedule.isOwner = isOwner;
            schedule.permission = isOwner ? 'edit' : formattedMembers.find(member => member._id.toString() === userId)?.permission;
            schedule.canCreateGroupChat = !isExistGroupChat && schedule.members.length >= 1;
            return schedule;
        });

        return orderBy(formattedSchedules, ['startDate'], ['desc']);
    } catch (error) {
        throw new BadrequestError(`Failed to retrieve schedules: ${error.message}`);
    }
};

const getUserCalendar = async (userId) => {
    try {
        const schedules = await Schedule.find(
            { isActive: true, ownerId: userId },
            { _id: 1, plans: 1 }
        ).exec();

        const calendars = schedules.flatMap(schedule =>
            schedule.plans.map(plan => ({
                id: schedule._id.toString(),
                title: plan.title,
                start: plan.startAt,
                end: plan.endAt
            }))
        );

        return calendars;
    } catch (error) {
        throw new BadrequestError(`Get user calendar failed: ${error.message}`);
    }
};

const getById = async (scheduleId) => {
    try {
        const schedule = await Schedule.findById(scheduleId).populate({
            path: 'members.memberId',
            select: 'name email avatar'
        }).lean();

        schedule.members = schedule.members.map(member => ({
            ...member.memberId
        }));
        return schedule
    } catch (error) {
        throw new BadrequestError('Get schedule by id failed')
    }
}

const create = async (schedule) => {
    try {
        const { error, value } = createScheduleJoi.validate(schedule);
        if (error) {
            throw new BadrequestError(error.details[0].message);
        }
        const currentDate = new Date(Date.now());

        if (isLessThanDays(value.startDate, currentDate)) {
            value.status = 'completed';
        } else if (isGreaterThanDays(value.startDate, currentDate)) {
            value.status = 'pending';
        } else {
            value.status = getStatusByTime2(value.startDate, value.endDate);
        }

        if (value.plans && value.plans.length > 0) {
            value.plans = value.plans.map((plan, index, plans) => {
                if (index < plans.length - 1) {
                    plan.endAt = plans[index + 1].startAt;
                } else {
                    plan.endAt = value.endDate;
                }
                return plan;
            });
        }

        const newSchedule = await Schedule.create(value);
        scheduleJob(newSchedule._id);

        return newSchedule;
    } catch (error) {
        throw new BadrequestError('Create new schedule failed');
    }
};

const update = async (schedule) => {
    const { _id, ...payload } = schedule;
    try {
        const { error, value } = updateScheduleJoi.validate(payload);
        if (error) {
            throw new BadrequestError(error.message);
        }

        const updatedSchedule = await Schedule.findOneAndUpdate({ _id }, value, { new: true });
        if (payload?.startDate && payload.startDate !== updatedSchedule?.startDate) {
            scheduleJob(updatedSchedule);
        }
        return updatedSchedule;
    } catch (error) {
        throw new BadrequestError('Update schedule failed')
    }
}

const addFriendToSchedule = async ({ friendId, scheduleId }) => {
    try {
        await Member.create({
            memberId: friendId,
            scheduleId
        })
    } catch (error) {
        throw new BadrequestError('Add member to schedule failed')
    }
}

const editPermission = async ({ memberId, scheduleId, permission }) => {
    try {
        const updatedSchedule = await Schedule.findOneAndUpdate(
            {
                _id: toObjectId(scheduleId),
                'members.memberId': toObjectId(memberId)
            },
            { $set: { 'members.$[member].permission': permission } },
            { arrayFilters: [{ 'member.memberId': toObjectId(memberId) }], new: true }
        );

        return updatedSchedule;
    } catch (error) {
        throw new BadrequestError('Update permissions failed')
    }
}

const getDetailSchedule = async (scheduleId, userId) => {
    try {
        const currentDate = new Date(Date.now());

        // Get schedule and check if it's a group chat
        const [schedule, isExistGroupChat] = await Promise.all([
            Schedule.findById(scheduleId)
                .populate({
                    path: 'members.memberId',
                    select: 'name email avatar'
                })
                .lean(),
            conversationModel.exists({ type: 'group', _id: scheduleId })
        ]);

        if (!schedule) {
            throw new BadRequestError('Schedule not found');
        }

        schedule.plans = orderBy(schedule.plans, ['startAt'], ['asc']);

        // Format plans and set status
        const formatPlans = schedule.plans.map(plan => {
            let status;

            if (isLessThanDays(plan.startAt, currentDate)) {
                status = 'done';
            } else if (isGreaterThanDays(plan.startAt, currentDate)) {
                status = 'in_coming';
            } else {
                status = getStatusByTime(plan.startAt, plan.endAt);
            }

            return { ...plan, status };
        });

        // Calculate progress
        const countDoneSchedule = formatPlans.filter(plan => plan.status === 'done').length;
        const progress = {
            percent: Math.round((countDoneSchedule / schedule.plans.length) * 100),
            part: `${countDoneSchedule} / ${schedule.plans.length}`
        };

        // Format member list
        const formattedMembers = schedule.members.map(member => ({
            ...member.memberId,
            permission: member.permission,
            isActive: member.isActive
        }));

        // Get owner info
        const owner = await getUserSettings(schedule.ownerId);
        const isOwner = schedule.ownerId.toString() === userId;
        const userPermission = formattedMembers.find(member => member._id.toString() === userId)?.permission;

        schedule.plans = formatPlans;
        schedule.progress = progress;
        schedule.members = [owner, ...formattedMembers];
        schedule.isOwner = isOwner;
        schedule.permission = isOwner ? 'edit' : userPermission;
        schedule.canCreateGroupChat = !isExistGroupChat && schedule.members.length >= 1;

        return schedule;
    } catch (error) {
        throw new BadrequestError(`Get detail schedule failed: ${error.message}`);
    }
};

const deleteSchedule = async (scheduleId) => {
    try {
        const deletedSchedule = await Schedule.findOneAndDelete({ _id: scheduleId });
        return deletedSchedule;
    } catch (error) {
        throw new BadrequestError('Delete schedule failed')
    }
}

module.exports = {
    create, update, addFriendToSchedule, editPermission,
    getAll, getById, getUserCalendar, getDetailSchedule, deleteSchedule
};
