'use strict';
const express = require('express');
const router = express.Router();


router.use('/auth', require('./access'));
router.use('/friend', require('./friend'));
router.use('/schedule', require('./schedule'));

module.exports = router;
