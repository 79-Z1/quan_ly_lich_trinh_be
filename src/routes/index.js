'use strict';
const express = require('express');
const asyncHandler = require('../helpers/asyncHandler');
const testController = require('../controller/test.controller');
const router = express.Router();


router.use('/', asyncHandler(testController.test));

module.exports = router;
