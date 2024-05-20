'use strict';
const express = require('express');
const router = express.Router();


router.use('/auth', require('./access'));
router.use('/friend', require('./friend'));
router.use('/schedule', require('./schedule'));
router.use('/chat', require('./chat'));
router.use('/user', require('./user'));
router.use('/noti', require('./noti'));
router.use('/admin', require('./admin'));
router.use('/gemini', require('./gemini'));

module.exports = router;
