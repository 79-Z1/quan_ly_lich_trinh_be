'use strict';
const express = require('express');
const router = express.Router();


router.use('/auth', require('./access'));
router.use('/friend', require('./friend'));
router.use('/schedule', require('./schedule'));
router.use('/chat', require('./chat'));
router.use('/user', require('./user'));
router.use('/admin', require('./admin'));

module.exports = router;
