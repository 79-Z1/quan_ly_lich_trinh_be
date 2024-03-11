'use strict';
const express = require('express');
const router = express.Router();


router.use('/api/auth', require('./access'));
router.use('/api/friend', require('./friend'));
router.use('/api/schedule', require('./schedule'));

module.exports = router;
