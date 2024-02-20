'use strict'
const JWT = require('jsonwebtoken');
const { AuthFailurError, BadrequestError } = require('@shared/core/error.response');
const asyncHandler = require('@shared/helpers/asyncHandler');
const { findByUserId } = require('../services/keyToken.service');
const { logger } = require('@shared/helpers/logger');
const properties = require('@shared/helpers/propertiesReader');
const { handleObject } = require("@shared/utils");


const HEADER = {
    API_KEY: 'x-api-key',
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
                throw new BadrequestError(properties.get('v1000'))
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new Error(properties.get('v1060'))
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
                throw new BadrequestError(properties.get('v1000'))
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
    if (!userId) throw new BadrequestError(properties.get('v1008'));

    //2. get access token
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new AuthFailurError(properties.get('v1073'));

    if (req.headers[HEADER.REFRESHTOKEN]) {
        const refreshToken = req.headers[HEADER.REFRESHTOKEN];
        logger.info(
            `Middleware -> authentication [START]\n(INPUT) ${handleObject({ userId, refreshToken })
            }`
        )
        const decodeUser = JWT. verify(refreshToken, keyStore.Public_Key);
        if(!decodeUser) throw new AuthFailurError(properties.get('v1073'));
        if (userId !== decodeUser.userId) throw new AuthFailurError(properties.get('v1073'));
        req.keyStore = keyStore;
        req.user = decodeUser;
        req.refreshToken = refreshToken;
        logger.info(
            `Middleware -> authentication [END]\n(INPUT) ${handleObject({ 
                keyStore: req.keyStore,
                decodeUser : req.user,
                refreshToken: req.refreshToken
            })
            }`
        )
        return next();
    }

    //3 verify token
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailurError(properties.get('v1073'));
    logger.info(
        `Middleware -> authentication [START]\n(INPUT) ${handleObject({ userId, accessToken })
        }`
    )

    //4. check user in dbs
    //5. check keyStore with this userId
    //6. OK all => return next()
    const decodeUser = await verifyJWT(accessToken, keyStore.Public_Key)
    if(!decodeUser) throw new AuthFailurError(properties.get('v1073'));
    if (userId !== decodeUser.userId) throw new BadrequestError(properties.get('v1073'));
    req.keyStore = keyStore;
    req.user = decodeUser;
    logger.info(
        `Middleware -> authentication [END]\n(INPUT) ${handleObject({ 
            keyStore: req.keyStore,
            decodeUser : req.user,
        })
        }`
    )
    return next();
})

const verifyJWT = async (token, keySecret) => {
    try {
        return await JWT.verify(token, keySecret);
    } catch (error) {
        throw new AuthFailurError(properties.get('v1073'));
    }
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    createAccessToken
}