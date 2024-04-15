'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const { authentication } = require('../../auth/auth-utils');
const UserController = require('../../modules/user/user.controller');


/// ---------------------------- No need check authen route ---------------------------- ///
router.get('/search', asyncHandler(UserController.searchUsersByName));

/// AUTHENTICATION
router.use(authentication)

/// ---------------------------- Need check authen route ---------------------------- ///

module.exports = router;