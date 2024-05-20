'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const { authentication } = require('../../auth/auth-utils');
const NotificationController = require('../../modules/notification/notification.controller');


/// AUTHENTICATION
router.use(authentication)
/// ---------------------------- Need check authen route ---------------------------- ///
router.get('/', asyncHandler(NotificationController.get));

module.exports = router;