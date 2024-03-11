'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { createUser } = require("./user.repo");


class UserService {

    static = async ({ name, password = '', email, ...rest }) => {
        if (!name) throw new BadrequestError('Name is required');
        if (!email) throw new BadrequestError('Email is required');

        logger.info(
            `UserService -> create [START]\n(INPUT) ${handleObject({ name, password, email, ...rest })
            }`
        )

        const user = await createUser({ name, password, email, ...rest })
        if (!user) throw new BadrequestError('Create user failed');

        logger.info(
            `UserService -> create [END]\n(OUTPUT) ${handleObject({ user })
            }`
        )
        return user;
    }
}

module.exports = UserService;
