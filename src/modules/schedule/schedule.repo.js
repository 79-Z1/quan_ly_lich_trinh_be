const { BadrequestError } = require('../../common/core/error.response');
const { Schedule, Member } = require('./schedule.model');
const { createScheduleJoi, updateScheduleJoi } = require('./schedule.validate.js');
const { compareDays } = require('../../common/utils/date.util');
const User = require('../user/user.model.js');
const { toObjectId, getUnSelectData } = require('../../common/utils/object.util.js');


const getAll = async (userId) => {
    try {
        return await Schedule.find({ isActive: true, ownerId: userId }).lean();
    } catch (error) {
        throw new BadrequestError('Get all schedule failed')
    }
}

const getUserCalendar = async (userId) => {
    try {
        const schedules = await Schedule.find({ isActive: true, ownerId: userId }).lean();
        const calendars = schedules.map((schedule) => {
            return {
                id: schedule._id,
                title: schedule.topic,
                start: schedule.startDate,
                end: schedule.endDate
            }
        })
        return calendars
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
        console.log("🚀 ~ getMemberList ~ error:::", error);
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

        const newSchedule = await Schedule.create(value);
        return newSchedule;
    } catch (error) {
        console.log("🚀 ~ create ~ error:::", error);
        throw new BadrequestError('Create new schedule failed')
    }
}

const update = async (schedule) => {
    try {
        const { error, value } = updateScheduleJoi.validate(schedule);
        if (error) {
            throw new BadrequestError(error.message);
        }

        const updatedSchedule = await Schedule.findByIdAndUpdate(schedule._id, {
            value
        });
        return updatedSchedule;
    } catch (error) {
        throw new BadrequestError('Create new schedule failed')
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

module.exports = {
    create, update, addFriendToSchedule, editPermissions,
    getAll, getById, getUserCalendar
};
