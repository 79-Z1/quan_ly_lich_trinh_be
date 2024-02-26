'use strict';
const express = require('express');
const router = express.Router();


router.use('/api/auth', require('./access'));

module.exports = router;
