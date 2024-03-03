'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const accessController = require('../../auth/access.controller');
const { authentication } = require('../../auth/auth-utils');


router.post('/signup', asyncHandler(accessController.signUp));
router.post('/login', asyncHandler(accessController.login));

/// AUTHENTICATION
router.use(authentication)

router.post('/logout', asyncHandler(accessController.logout));
router.post('/refresh-token', asyncHandler(accessController.handleRefreshToken));

module.exports = router;