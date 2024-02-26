'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const User = require("./user.model");

const findUserByname = async (name) => {
    try {
        return await User.findOne({ name }).lean()
    } catch (error) {
        throw new BadrequestError('Find user failed')
    }
}

const findUserById = async (id) => {
    try {
        return await User.findById(
            toObjectIdMongodb(id)
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

const createUser = async ({ name, password, address, email }) => {
    try {
        return await User.create({
            name, password, address, email
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

module.exports = {
    findUserByname,
    findUserByEmail,
    createUser,
    findUserById,
    updateOrCreateUser
};
