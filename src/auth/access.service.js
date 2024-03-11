'use strict';

const { logger } = require("../common/helpers/logger");
const crypto = require('node:crypto');
const Friend = require("../modules/friend/friend.model");
const bcrypt = require('bcrypt');
const userService = require("../modules/user/user.service");
const { createTokenPair } = require("./auth-utils");
const { findUserByEmail, createUser, findByOAuthAccount, transformGoogleProfile, transformFacebookProfile } = require("../modules/user/user.repo");
const KeyTokenService = require("../modules/key-token/key-token.service");
const { updateKeyToken } = require("../modules/key-token/keytoken.repo");
const { handleObject, generatePublicPrivateToken, getInfoData, isStrongPassword } = require("../common/utils");
const { AuthFailurError, ConflicRequestError } = require("../common/core/error.response");



class AccessService {
    static handleRefreshToken = async ({ refreshToken, user, keyStore }) => {
        if (!refreshToken) throw new AuthFailurError('Refresh token is required')
        if (!user) throw new AuthFailurError('User is required')
        if (!keyStore) throw new AuthFailurError('Key store is required')
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
        if (!keyToken) throw new AuthFailurError('Update key token failed');

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
        if (!delKey) throw new AuthFailurError('Delete key token failed');

        logger.info(
            `AccessService -> logout [END]\n(OUTPUT) ${handleObject({ keyStore })
            }`
        )
        return delKey
    }

    static login = async ({ email, password, rememberMe = false }) => {
        if (!email) throw new AuthFailurError('Email is required')
        if (!password) throw new AuthFailurError('Password is required')
        logger.info(
            `AccessService -> login [START]\n(INPUT) ${handleObject({ email, password, rememberMe })
            }`
        )
        // 1. check user in dbs
        const foundUser = await findUserByEmail(email);
        if (!foundUser) throw new AuthFailurError('User not found');

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

        if (!publicKeyStringSaved) throw new AuthFailurError('Create key token failed');

        logger.info(
            `AccessService -> login [END]\n(OUTPUT) ${handleObject({
                user: getInfoData({ fields: ['_id', 'name', 'email'], object: foundUser }),
                tokens: tokens,
                rememberMe
            })
            }`
        )
        return {
            user: getInfoData({ fields: ['_id', 'name', 'email', 'avatar', 'address'], object: foundUser }),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            rememberMe
        }
    }

    static async signInWithGoogle({ token }) {
        logger.info(
            `AccessService -> signInWithGoogle [START]\n(INPUT) ${handleObject({ token })
            }`
        )
        // Get user account from Google
        const googleProfile = await this.getGoogleAccount(token);

        // Find user by email
        let user = await findUserByEmail(googleProfile.email);

        if (user) {
            // Check if user is active
            if (!user.isActive) {
                throw new AuthFailurError('User is inactive');
            }
            // Check if user is existing with another provider
            if (user.provider !== 'google') {
                throw new ConflicRequestError(`User is existing with ${user.provider} provider.`);
            }
            // Find user using Google OAuth account
            user = await findByOAuthAccount('google', googleProfile.sub);
        } else {
            // Create new user from Google OAuth account
            user = await this.createNewUserFromOAuthProfile('google', googleProfile);
        }

        // create privateKey, publicKey and save public key
        const { privateKey, publicKey } = generatePublicPrivateToken();
        const publicKeyString = publicKey.toString();
        const publicKeyObject = crypto.createPublicKey(publicKeyString)

        // generate tokens
        const { _id: userId } = user;
        const tokens = await createTokenPair({ userId }, publicKeyObject, privateKey);

        // get data return login
        const publicKeyStringSaved = await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            userId,
            publicKeyString
        })

        if (!publicKeyStringSaved) throw new AuthFailurError('Create key token failed');

        logger.info(
            `AccessService -> signInWithGoogle [END]\n(OUTPUT) ${handleObject({
                user: getInfoData({ fields: ['_id', 'name', 'email', 'avatar', 'address'], object: user }),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            })
            }`
        )

        return {
            user: getInfoData({ fields: ['_id', 'name', 'email', 'avatar', 'address'], object: user }),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }

    static async getGoogleAccount(token) {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        return await response.json();
    }

    static async createNewUserFromOAuthProfile(provider, profile) {
        let transformedData = {};

        switch (provider) {
            case 'google':
                transformedData = await transformGoogleProfile(profile);
                break;
            case 'facebook':
                transformedData = await transformFacebookProfile(profile);
                break;
        }

        const newUser = await userService.create({
            name: transformedData.name,
            email: transformedData.email,
            avatar: transformedData.avatar,
            providerAccountId: transformedData.providerAccountId,
            provider: provider,
            authType: 'oauth'
        });

        return newUser;
    }

    static signUp = async ({ password, name, email }) => {
        if (!name) throw new AuthFailurError('Name is required')
        if (!password) throw new AuthFailurError('Password is required')
        if (!email) throw new AuthFailurError('Email is required')

        logger.info(
            `AccessService -> signUp [START]\n(INPUT) ${handleObject(
                { password, name, email }
            )}`
        )
        // B1: check Username
        const user = await findUserByEmail(email);
        if (user) throw new AuthFailurError('User is existed');

        // B2: hash password
        if (!isStrongPassword(password)) throw new AuthFailurError('Password is not strong enough');
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            name, email, password: passwordHash
        });

        if (!newUser) throw new AuthFailurError('Sign up failed')
        return true;
    }
}

module.exports = AccessService
