'use strict'
const JWT = require('jsonwebtoken');
const { findByUserId } = require('../modules/key-token/key-token.service');
const { logger } = require('../common/helpers/logger');
const asyncHandler = require('../common/helpers/asyncHandler');
const { BadrequestError, AuthFailurError } = require('../common/core/error.response');
const { handleObject } = require('../common/utils');


const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        });

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                logger.error(`error verify:::`, err);
                throw new BadrequestError('Wrong access token key');
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new BadrequestError('Create token pair failed')
    }
}

const createAccessToken = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        });


        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                logger.error(`error verify:::`, err);
                throw new BadrequestError('Wrong access token key');
            }
        })

        return { accessToken }
    } catch (error) {
        throw new Error(properties.get('v1060'))
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    //1. check userid
    const userId = req.headers[HEADER.CLIENT_ID];
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    //2. get access token
    const keyStore = await findByUserId(userId);
    logger.info(
        `AuthUtils -> authentication [START]\n(INPUT) ${handleObject({ userId, accessToken })
        }`
    )

    if (!userId) throw new AuthFailurError('User Id is required');
    if (!keyStore) throw new AuthFailurError('User Id is wrong');

    if (req.headers[HEADER.REFRESHTOKEN]) {
        const refreshToken = req.headers[HEADER.REFRESHTOKEN];
        logger.info(
            `Middleware -> authentication [START]\n(INPUT) ${handleObject({ userId, refreshToken })
            }`
        )
        const decodeUser = JWT.verify(refreshToken, keyStore.publicKey);
        if (!decodeUser) throw new AuthFailurError('User Id is wrong');
        if (userId !== decodeUser.userId) throw new AuthFailurError('User Id is wrong');
        req.keyStore = keyStore;
        req.user = decodeUser;
        req.refreshToken = refreshToken;
        logger.info(
            `AuthUtils -> authentication [END]\n(INPUT) ${handleObject({
                passRefreshToken: true
            })
            }`
        )
        return next();
    }

    //3 verify token
    if (!accessToken) throw new AuthFailurError('Access token is required');

    //4. check user in dbs
    //5. check keyStore with this userId
    //6. OK all => return next()
    const decodeUser = await verifyJWT(accessToken, keyStore.publicKey)
    if (!decodeUser) throw new AuthFailurError('Wrong access token or key');
    if (userId !== decodeUser.userId) throw new BadrequestError('Wrong access token or key');
    req.keyStore = keyStore;
    req.user = decodeUser;
    logger.info(
        `Middleware -> authentication [END]\n(INPUT) ${handleObject({
            passRefreshToken: true
        })
        }`
    )
    return next();
})

const verifyJWT = async (token, keySecret) => {
    try {
        return await JWT.verify(token, keySecret);
    } catch (error) {
        throw new AuthFailurError('Wrong access token or key');
    }
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    createAccessToken
}