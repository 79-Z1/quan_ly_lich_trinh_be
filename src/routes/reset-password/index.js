'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const ResetPasswordController = require('../../modules/reset-password/reset-password.controller');


router.post('/', asyncHandler(ResetPasswordController.sendResetPasswordRequest));

module.exports = router;