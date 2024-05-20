'use strict';
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../common/helpers/asyncHandler');
const { authentication } = require('../../auth/auth-utils');
const GeminiController = require('../../modules/gemini/gemini.controller');

/// AUTHENTICATION
router.use(authentication)
/// ---------------------------- Need check authen route ---------------------------- ///
router.post('/', asyncHandler(GeminiController.askGemini));

module.exports = router;