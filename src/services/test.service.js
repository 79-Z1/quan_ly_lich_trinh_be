'use strict';

const { logger } = require("../helpers/logger");
const { handleObject } = require("../utils");


class TestService {

    static test = async (req) => {
        logger.info(
            `AccessService -> test [END]\n(OUTPUT) ${handleObject({
                data: 'data'
            })
            }`
        )
        return {
            data: 'data'
        }
    }
}

module.exports = TestService
