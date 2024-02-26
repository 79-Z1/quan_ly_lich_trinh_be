'use strict';

const { createTokenPair } = require("./auth-utils");
const { findUserByEmail, createUser } = require("../modules/user/user.repo");
const crypto = require('node:crypto');
const KeyTokenService = require("../modules/key-token/key-token.service");
const bcrypt = require('bcrypt');
const { updateKeyToken } = require("../modules/key-token/keytoken.repo");
const { logger } = require("../common/helpers/logger");
const { handleObject, generatePublicPrivateToken, getInfoData, isStrongPassword } = require("../common/utils");
const { BadrequestError, AuthFailurError } = require("../common/core/error.response");
const Friend = require("../modules/friend/friend.model");



const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
}

class AccessService {
    static handleRefreshToken = async ({ refreshToken, user, keyStore }) => {
        if (!refreshToken) throw new BadrequestError('Refresh token is required')
        if (!user) throw new BadrequestError('User is required')
        if (!keyStore) throw new BadrequestError('Key store is required')
        logger.info(
            `AccessService -> handleRefreshToken [START]\n(INPUT) ${handleObject({ refreshToken, user, keyStore })
            }`
        )
        const { userId } = user;

        if (keyStore.refreshToken !== refreshToken)
            throw new AuthFailurError('Invalid refresh token');

        const { privateKey, publicKey } = generatePublicPrivateToken();
        const publicKeyString = publicKey.toString();
        const publicKeyObject = crypto.createPublicKey(publicKeyString)

        const tokens = await createTokenPair({ userId }, publicKeyObject, privateKey);
        //update token
        const keyToken = await updateKeyToken({
            keyTokenId: keyStore['_id'],
            publicKey: publicKeyString,
            newRefreshToken: tokens.refreshToken,
        })
        if (!keyToken) throw new BadrequestError('Update key token failed');

        logger.info(
            `AccessService -> handleRefreshToken [END]\n(OUTPUT) ${handleObject({
                user: getInfoData({ fields: ['userId'], object: user }),
                tokens
            })
            }`
        )
        return {
            user: getInfoData({ fields: ['userId'], object: user }),
            tokens
        }
    }

    static logout = async (keyStore) => {
        logger.info(
            `AccessService -> logout [START]\n(INPUT) ${handleObject({ keyStore })
            }`
        )
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        if (!delKey) throw new BadrequestError('Delete key token failed');

        logger.info(
            `AccessService -> logout [END]\n(OUTPUT) ${handleObject({ keyStore })
            }`
        )
        return delKey
    }

    static login = async ({ email, password, refreshToken = null, rememberMe = false }) => {
        if (!email) throw new BadrequestError('Email is required')
        if (!password) throw new BadrequestError('Password is required')
        logger.info(
            `AccessService -> login [START]\n(INPUT) ${handleObject({ email, password, refreshToken, rememberMe })
            }`
        )
        // 1. check user in dbs
        const foundUser = await findUserByEmail(email);
        if (!foundUser) throw new BadrequestError('User not found');

        // 2. match password 
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) throw new AuthFailurError('Password is incorrect');

        //3. create privateKey, publicKey and save public key
        const { privateKey, publicKey } = generatePublicPrivateToken();
        const publicKeyString = publicKey.toString();
        const publicKeyObject = crypto.createPublicKey(publicKeyString)

        // 4. generate tokens
        const { _id: userId } = foundUser;
        const tokens = await createTokenPair({ userId }, publicKeyObject, privateKey);

        // 5. get data return login
        const publicKeyStringSaved = await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            userId,
            publicKeyString
        })

        if (!publicKeyStringSaved) throw new BadrequestError('Create key token failed');

        logger.info(
            `AccessService -> login [END]\n(OUTPUT) ${handleObject({
                user: getInfoData({ fields: ['_id', 'name', 'email'], object: foundUser }),
                tokens: tokens,
                rememberMe
            })
            }`
        )
        return {
            user: getInfoData({ fields: ['_id', 'name', 'email'], object: foundUser }),
            tokens: tokens,
            rememberMe
        }
    }

    static signUp = async ({ password, name, address, email }) => {
        if (!name) throw new BadrequestError('Name is required')
        if (!password) throw new BadrequestError('Password is required')
        if (!address) throw new BadrequestError('Address is required')
        if (!email) throw new BadrequestError('Email is required')

        logger.info(
            `AccessService -> signUp [START]\n(INPUT) ${handleObject(
                { password, name, address, email }
            )}`
        )
        // B1: check Username
        const user = await findUserByEmail(email);
        if (user) throw new BadrequestError('User is existed');

        // B2: hash password
        if (!isStrongPassword(password)) throw new BadrequestError('Password is not strong enough');
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            name, address, email, password: passwordHash
        });

        if (newUser) {
            // Create new friend document
            await Friend.create({
                userId: newUser._id
            })
            // created privateKey, publicKey
            const { privateKey, publicKey } = generatePublicPrivateToken();
            const publicKeyString = publicKey.toString();
            const publicKeyObject = crypto.createPublicKey(publicKeyString)

            const tokens = await createTokenPair({ userId: newUser._id }, publicKeyObject, privateKey);

            const publicKeyStringSaved = await KeyTokenService.createKeyToken({
                refreshToken: tokens.refreshToken,
                userId: newUser._id,
                publicKeyString
            })

            if (!publicKeyStringSaved) throw new BadrequestError(properties.get('v1069'))

            logger.info(
                `AccessService -> signUp [END]\n(OUTPUT) ${handleObject({
                    User: getInfoData({ fields: ['_id', 'name', 'email'], object: newUser }),
                    Tokens: tokens
                })
                }`
            )
            return {
                user: getInfoData({ fields: ['_id', 'name', 'email'], object: newUser }),
                Tokens: tokens
            }
        }
        throw new BadrequestError('Sign up failed')
    }
}

module.exports = AccessService
