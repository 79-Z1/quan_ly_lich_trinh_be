'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId, getInfoDataWithout } = require("../../common/utils/object.util");
const { normalizeString } = require("../../common/utils/string");
const Friend = require("../friend/friend.model");
const { Schedule } = require("../schedule/schedule.model");
const User = require("./user.model");

const findUserByname = async (name) => {
    try {
        return await User.findOne({ name }).lean()
    } catch (error) {
        throw new BadrequestError('Find user failed')
    }
}

const getUserSettings = async (userId) => {
    try {
        const user = await User.findOne({ _id: toObjectId(userId) }).lean();
        return getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'isActive', 'createdAt', 'updatedAt', 'role'], object: user });
    } catch (error) {
        throw new BadrequestError('Get user settings failed')
    }
}

const getUserProfile = async (yourId, userId) => {
    try {
        const user = await User.findOne({ _id: toObjectId(userId) }).lean();
        const userFriend = await Friend.findOne({ userId: toObjectId(userId) });
        const userSchedule = await Schedule.find({ ownerId: toObjectId(userId), isActive: true, startDate: { $gte: new Date() }, endDate: { $lte: new Date() } }).lean();

        const friendIds = userFriend.friends.map(friend => friend.friendId.toString());
        const requestSentIds = userFriend.friendsRequestSent.map(friend => friend.recipientId.toString());
        const requestReceivedIds = userFriend.friendsRequestReceved.map(friend => friend.senderId.toString());

        if (yourId === userId) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'self',
                schedules: userSchedule
            }
        }
        if (friendIds.includes(yourId)) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'friend',
                schedules: userSchedule
            }
        }
        if (requestReceivedIds.includes(yourId)) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'request-sent',
                schedules: userSchedule
            }
        }
        if (requestSentIds.includes(yourId)) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'request-received',
                schedules: userSchedule
            }
        }

        return {
            user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
            status: 'none'
        }
    } catch (error) {
        throw new BadrequestError('Get profile failed')
    }
}

const updateUserSocketId = async (id, socketId) => {
    try {
        return await User.findOneAndUpdate({ _id: id }, { socketId }, { new: true })
    } catch (error) {
        throw new Error('Update user socket id failed')
    }
}

const findUserSocketId = async (userId) => {
    try {
        return await User.findOne({ _id: userId }).select('socketId').lean()
    } catch (error) {
        throw new BadrequestError('Find user socket id failed')
    }
}

const findUserById = async (id) => {
    try {
        return await User.findById(
            toObjectId(id)
        )
    } catch (error) {
        throw new BadrequestError('Find user failed')
    }
}

const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email }).lean()
    } catch (error) {
        throw new BadrequestError('Find user failed')
    }
}

const createUser = async ({ name, password, email, ...rest }) => {
    try {
        return await User.create({
            name, password, email, ...rest
        })
    } catch (error) {
        throw new BadrequestError('Create user failed: ', error?.message)
    }
}

const updateOrCreateUser = async (profile) => {
    try {
        const filter = { oathId: profile.id },
            bodyUpdate = {
                oathId: profile.id,
                fullname: profile.displayName,
                Email: profile.emails ? profile.emails[0].value : null
            },
            option = { new: true, upsert: true };
        return await User.findOneAndUpdate(filter, bodyUpdate, option)
    } catch (error) {
        throw new BadrequestError('Create user failed')
    }
}

const findByOAuthAccount = async (provider, providerAccountId) => {
    const user = await User.findOne({ provider, providerAccountId });

    return user;
}

const transformGoogleProfile = async (profile) => {
    return {
        name: profile.name,
        email: profile.email,
        avatar: profile.picture,
        providerAccountId: profile.sub,
        locale: profile.locale
    };
}

const transformFacebookProfile = async (profile) => {
    return {
        name: profile.name,
        email: profile.email,
        avatar: profile.picture?.data?.url,
        providerAccountId: profile.id
    };
}

const searchUsersByName = async (name) => {
    try {
        const normalizedSearchTerm = normalizeString(name);
        const regex = new RegExp(normalizedSearchTerm, 'i');
        const users = await User.find({}).select('name email avatar').lean();

        const filteredUsers = users.filter(user => {
            const normalizedUserName = normalizeString(user.name);
            return regex.test(normalizedUserName);
        });
        console.log("🚀 ~ searchUsersByName ~ filteredUsers:::", filteredUsers);

        return filteredUsers ?? []
    } catch (error) {
        console.log("🚀 ~ searchUsersByName ~ error:::", error);
        throw new BadrequestError('Find user failed')
    }
}

const getUserName = async (userId) => {
    try {
        const user = await User.findById(userId)
        return user.name
    } catch (error) {
        throw new BadrequestError('Get user name failed')
    }
}

const updateUser = async (userId, data) => {
    try {
        return await User.findByIdAndUpdate(userId, data, { new: true })
    } catch (error) {
        throw new BadrequestError('Update user failed')
    }
}

module.exports = {
    findUserByname,
    findUserByEmail,
    findUserSocketId,
    createUser,
    findUserById,
    updateOrCreateUser,
    updateUserSocketId,
    findByOAuthAccount,
    transformGoogleProfile,
    transformFacebookProfile,
    searchUsersByName,
    getUserName,
    getUserProfile,
    getUserSettings,
    updateUser
}
