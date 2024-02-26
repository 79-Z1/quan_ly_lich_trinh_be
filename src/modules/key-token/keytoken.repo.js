'use strict';
const { BadrequestError } = require('../../common/core/error.response');
const { toObjectId } = require('../../common/utils');
const KeyToken = require('./keytoken.model')


const updateKeyToken = async ({ keyTokenId, publicKey, newRefreshToken, isNew = true }) => {
    try {
        const bodyUpdate = {
            $set: {
                refreshToken: newRefreshToken,
            },
            publicKey: publicKey
        }
        return await KeyToken.findByIdAndUpdate(
            toObjectId(keyTokenId),
            bodyUpdate,
            { new: isNew }
        )
    } catch (error) {
        throw new BadrequestError('Update key token failed');
    }
}

const findByUserId = async (userId) => {
    try {
        return await KeyToken.findOne({ userId: toObjectId(userId) }).lean()
    } catch (error) {
        throw new BadrequestError('Find key token failed');
    }
}

const updateOrCreateKeyToken = async ({ userId, publicKey }) => {
    try {
        const filter = { userId: userId };
        const update = {
            publicKey: publicKey,
        }
        const options = { upsert: true, new: true };

        return await KeyToken.findOneAndUpdate(filter, update, options);
    } catch (error) {
        throw new BadrequestError('Create key token failed');
    }
}

const findByRefreshToken = async (refreshToken) => {
    try {
        return await KeyToken.findOne({ refreshToken: refreshToken })
    } catch (error) {
        throw new BadrequestError('Find key token failed');
    }
}

const deleteKeyByUserId = async (userId) => {
    try {
        return await KeyToken.deleteOne({ userId: toObjectId(userId) })
    } catch (error) {
        throw new BadrequestError('Delete key token failed');
    }
}

const removeKeyById = async (id) => {
    try {
        return await KeyToken.remove(toObjectId(id))
    } catch (error) {
        throw new BadrequestError('Delete key token failed');
    }
}

module.exports = {
    updateKeyToken,
    findByUserId,
    updateOrCreateKeyToken,
    findByRefreshToken,
    deleteKeyByUserId,
    removeKeyById
};
