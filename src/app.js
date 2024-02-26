
require('dotenv').config();
const express = require('express');
const app = express();

const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');

//# INIT MIDDLEWARE
app.use(morgan('dev'));
app.use(helmet());
app.use(compression()); // nén data trả về
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//# INIT PUB SUB REDIS

//# INIT DB
require('./dbs/init.mongodb');
const { checkOverload } = require('./common/helpers/check.connect');
const { logger } = require('./common/helpers/logger');
const { NotFoundError } = require('./common/core/error.response');
// checkOverload();

//# INIT ROUTES
app.use('/', require('./routes'));

//# HANDLING ERRORS
app.use((req, res, next) => {
    const error = new NotFoundError('Route Not Found!!!');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;

    logger.error(error.message)
    console.log(error.stack);
    return res.status(statusCode).json({
        status: error.status || 'Error',
        message: error.message || 'Internal Server Error'
    })
});

module.exports = app;
