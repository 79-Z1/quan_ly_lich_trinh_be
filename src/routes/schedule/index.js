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
router.post('/delete', asyncHandler(scheduleController.deleteSchedule));
router.patch('', asyncHandler(scheduleController.update));
router.patch('/edit-permission', asyncHandler(scheduleController.editPermission));
router.get('/calendar', asyncHandler(scheduleController.getUserCalendar));
router.get('/edit/:scheduleId', asyncHandler(scheduleController.getById));
router.get('/:scheduleId', asyncHandler(scheduleController.getDetailSchedule));
router.get('', asyncHandler(scheduleController.getAll));

module.exports = router;