'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const { authentication } = require('../../auth/auth-utils');
const scheduleController = require('../../modules/schedule/schedule.controller');


/// AUTHENTICATION
router.use(authentication)

/// ---------------------------- Need check authen route ---------------------------- ///
router.post('', asyncHandler(scheduleController.create));
router.patch('', asyncHandler(scheduleController.update));
router.get('/calendar', asyncHandler(scheduleController.getUserCalendar));
router.get('/:scheduleId', asyncHandler(scheduleController.getById));
router.get('', asyncHandler(scheduleController.getAll));

module.exports = router;