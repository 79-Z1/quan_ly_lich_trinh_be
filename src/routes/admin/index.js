'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const { authentication } = require('../../auth/auth-utils');
const AdminController = require('../../modules/admin/admin.controller');


/// AUTHENTICATION
router.use(authentication)
/// ---------------------------- Need check authen route ---------------------------- ///
router.get('/statistic/user', asyncHandler(AdminController.statisticUserThisMonth));
router.get('/statistic/schedule', asyncHandler(AdminController.statisticScheduleThisMonth));
router.get('/statistic', asyncHandler(AdminController.statisticScheduleByMonth));
router.get('/ranking', asyncHandler(AdminController.getRankingList));
router.get('/user', asyncHandler(AdminController.getAllUsers));
router.patch('/user', asyncHandler(AdminController.updateUser));

module.exports = router;