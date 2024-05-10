const { BadrequestError } = require('../../common/core/error.response');
const { Schedule, Member } = require('./schedule.model');
const { createScheduleJoi, updateScheduleJoi } = require('./schedule.validate.js');
const { compareDays, ltOrEqDays, getStatusByTime, isLessThanDays, isGreaterThanDays, formatVNDate } = require('../../common/utils/date.util');
const User = require('../user/user.model.js');
const { toObjectId, getUnSelectData } = require('../../common/utils/object.util.js');
const { getUserSettings } = require('../user/user.repo.js');
const { orderBy } = require('lodash');


const getAll = async (userId) => {
    try {
        const schedules = await Schedule.find({ isActive: true, ownerId: userId }).lean();
        await Promise.all(schedules.map(async (schedule) => {
            schedule.members = await getMemberList(schedule.members);
            return schedule;
        }));
        return schedules
    } catch (error) {
        throw new BadrequestError('Get all schedule failed')
    }
}

const getUserCalendar = async (userId) => {
    try {
        const schedules = await Schedule.find({ isActive: true, ownerId: userId }).lean();
        const calendars = schedules.map((schedule) => {
            const plans = schedule.plans.map((item) => {

                return {
                    id: schedule._id.toString(),
                    title: item.title,
                    start: item.startAt,
                    end: item.endAt
                }
            });
            return [...plans]
        })
        return calendars.flat()
    } catch (error) {
        throw new BadrequestError('Get user calendar failed')
    }
}

const getById = async (scheduleId) => {
    try {
        const schedule = await Schedule.findById(scheduleId).lean();
        schedule.members = await getMemberList(schedule.members);
        return schedule
    } catch (error) {
        throw new BadrequestError('Get schedule by id failed')
    }
}

const getMemberList = async (members) => {
    try {
        const memberList = await Promise.all(members.map(async (member) => {
            const scheduleMember = await User.findById(toObjectId(member.memberId))
                .select(getUnSelectData(['__v', 'createdAt', 'updatedAt', 'password', 'providerAccountId', 'provider', 'isActive', 'authType', 'socketId']))
            return scheduleMember
        }));

        return memberList ? memberList : []
    } catch (error) {
        throw new BadrequestError('Get member list failed')
    }
}

const create = async (schedule) => {
    try {
        const { error, value } = createScheduleJoi.validate(schedule);
        if (error) {
            throw new BadrequestError(error.message);
        }

        if (compareDays(value.startDate, new Date())) {
            value.status = 'in_progress'
        }
        if (value?.plans) {
            value?.plans.map((plan, index) => {
                if (!!value?.plans[index + 1]) {
                    plan.endAt = value?.plans[index + 1].startAt;
                } else {
                    plan.endAt = value?.endDate;
                }
                return plan;
            })
        }

        const newSchedule = await Schedule.create(value);
        return newSchedule;
    } catch (error) {
        throw new BadrequestError('Create new schedule failed')
    }
}

const update = async (schedule) => {
    const { _id, ...payload } = schedule;
    try {
        const { error, value } = updateScheduleJoi.validate(payload);
        if (error) {
            throw new BadrequestError(error.message);
        }

        const updatedSchedule = await Schedule.findOneAndUpdate({ _id }, value, { new: true });
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
        throw new BadrequestError('Add member toschedule failed')
    }
}

const editPermissions = async ({ friendId, scheduleId }) => {
    try {
        const query = {
            memberId: friendId,
            scheduleId
        }
        const bodyUpdate = { $set: { 'members.$.permission': permission } }
        const updatedSchedule = await Member.findOneAndUpdate(
            query,
            { $set: { 'members.$.permission': permission } },
            bodyUpdate,
            { new: true }
        );

        if (!updatedSchedule) {
            throw new BadRequestError('Schedule or member not found');
        }
        return updatedSchedule;
    } catch (error) {
        throw new BadrequestError('Update permissions failed')
    }
}

const getDetailSchedule = async (scheduleId) => {
    try {
        const schedule = await Schedule.findById(scheduleId).lean();
        schedule.plans = orderBy(schedule.plans, ['startAt'], ['asc']);
        const formatPlans = schedule.plans.map(plan => {
            let status;
            if (isLessThanDays(plan.startAt, new Date())) {
                status = 'done';
            } else if (isGreaterThanDays(plan.startAt, new Date())) {
                status = 'in_coming';
            } else {
                status = getStatusByTime(plan.startAt, plan.endAt)
            }
            return {
                ...plan,
                status
            }
        })
        const countDoneSchedule = formatPlans.filter((plan) => plan.status === 'done').length;
        const progress = {
            percent: Math.round(countDoneSchedule / schedule.plans.length * 100),
            part: `${countDoneSchedule} / ${schedule.plans.length}`
        }
        schedule.plans = formatPlans;
        schedule.progress = progress;
        const [formatMembers, owner] = await Promise.all([getMemberList(schedule.members), getUserSettings(schedule.ownerId)]);
        schedule.members = formatMembers
        schedule.members.unshift(owner);
        return schedule;
    } catch (error) {
        throw new BadrequestError('Get detail schedule failed')
    }
}

module.exports = {
    create, update, addFriendToSchedule, editPermissions,
    getAll, getById, getUserCalendar, getDetailSchedule
};
