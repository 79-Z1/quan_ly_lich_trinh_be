'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId } = require("../../common/utils/object.util");
const User = require("./user.model");

const findUserByname = async (name) => {
    try {
        return await User.findOne({ name }).lean()
    } catch (error) {
        throw new BadrequestError('Find user failed')
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
        ).lean()
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
    transformFacebookProfile
}
