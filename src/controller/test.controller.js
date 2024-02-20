'use strict';

const { SuccessResponse } = require("../core/success.response");
const TestService = require("../services/test.service");

class TestController {

    test = async (req, res, next) => {
        new SuccessResponse({
            message: 'Test successfully',
            metadata: await TestService.test(req)
        }).send(res);
    }

}

module.exports = new TestController();