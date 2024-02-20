'use strict'

const { BadrequestError, AuthFailurError, ForbiddenError } = require("@shared/core/error.response");
const asyncHandler = require("@shared/helpers/asyncHandler");
const { findApiKeyById } = require("../services/apiKey.service");

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}
const apiKey = asyncHandler(async (req, res, next) => {
    const key = req.headers[HEADER.API_KEY]?.toString();
    
    if (!key) throw new ForbiddenError(properties.get('v1015'));

    const apikey = await findApiKeyById(key);
    if (!apikey) throw new ForbiddenError(properties.get('v1015'));

    req.apikey = apikey;
    return next();
})

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.apikey.permissions) {
            throw new ForbiddenError(properties.get('v1015'));
        }

        const validPermission = req.apikey.permissions.includes(permission);
        if (!validPermission) {
            throw new ForbiddenError(properties.get('v1015'));
        }
        return next();
    }
}

module.exports = {
    apiKey,
    permission,
};
