'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const ResetPasswordController = require('../../modules/reset-password/reset-password.controller');


router.post('/send-mail', asyncHandler(ResetPasswordController.sendResetPasswordRequest));
router.get('/validate/:token', asyncHandler(ResetPasswordController.validateToken));
router.post('/', asyncHandler(ResetPasswordController.resetPassword));

module.exports = router;