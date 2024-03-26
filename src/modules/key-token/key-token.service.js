'use strict'

const { logger } = require("../../common/helpers/logger");
const {
    findByUserId,
    findByRefreshToken, deleteKeyByUserId,
    updateOrCreateKeyToken,
    removeKeyById
} = require("./keytoken.repo");
const { BadrequestError } = require("../../common/core/error.response");
const { handleObject } = require("../../common/utils");

class KeyTokenService {

    static createKeyToken = async ({ userId, publicKeyString, refreshToken }) => {
        if (!userId) throw new BadrequestError('User id is required')
        if (!publicKeyString) throw new BadrequestError('Public key is required')
        if (!refreshToken) throw new BadrequestError('Refresh token is required')
        logger.info(
            `KeyTokenService -> createKeyToken [START]\n(INPUT) ${handleObject({ userId, publicKeyString, refreshToken })
            }`
        )

        const keyToken = await updateOrCreateKeyToken({
            userId,
            publicKey: publicKeyString,
            refreshToken
        })

        logger.info(
            `KeyTokenService -> createKeyToken [END]\n(OUTPUT) ${keyToken?.publicKey
            }`
        )

        return keyToken ? keyToken.publicKey : null;
    }

    static findByUserId = async (userId) => {
        logger.info(
            `KeyTokenService -> findByUserId [START]\n(INPUT) ${handleObject({ userId })
            }`
        )

        const keytoken = await findByUserId(userId)
        logger.info(
            `KeyTokenService -> findByUserId [END]\n(OUTPUT) ${handleObject({ has: !!keytoken })
            }`
        )
        return keytoken;
    }

    static findByRefreshToken = async (refreshToken) => {
        logger.info(
            `KeyTokenService -> findByRefreshToken [START]\n(INPUT) ${handleObject({ refreshToken })
            }`
        )

        const keytoken = await findByRefreshToken(refreshToken)
        if (!keytoken) throw new BadrequestError('Wrong refresh token')

        logger.info(
            `KeyTokenService -> findByRefreshToken [END]\n(OUTPUT) ${handleObject({ keytoken })
            }`
        )
        return keytoken;
    }

    static deleteKeyByUserId = async (userId) => {
        logger.info(
            `KeyTokenService -> deleteKeyByUserId [START]\n(INPUT) ${handleObject({ userId })
            }`
        )

        const keytoken = await deleteKeyByUserId(userId)
        if (!keytoken) throw new BadrequestError('Delete key token failed')

        logger.info(
            `KeyTokenService -> deleteKeyByUserId [START]\n(INPUT) ${handleObject({ keytoken })
            }`
        )
        return keytoken;
    }

    static removeKeyById = async (id) => {
        logger.info(
            `KeyTokenService -> removeKeyById [START]\n(INPUT) ${handleObject({ id })
            }`
        )

        const keytoken = await removeKeyById(id)
        if (!keytoken) throw new BadrequestError('Delete key token failed')

        logger.info(
            `KeyTokenService -> removeKeyById [END]\n(INPUT) ${handleObject({ keytoken })
            }`
        )
        return keytoken;
    }
}

module.exports = KeyTokenService;