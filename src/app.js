
require('dotenv').config();
const cors = require('cors')
const express = require('express');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');

//# INIT MIDDLEWARE
app.use(cors())
app.use(morgan('dev'));
app.use(helmet());
app.use(compression()); // nén data trả về
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');

//# INIT PUB SUB REDIS

//# INIT DB
require('./dbs/init.mongodb');
const { checkOverload } = require('./common/helpers/check.connect');
const { logger } = require('./common/helpers/logger');
const { NotFoundError } = require('./common/core/error.response');
const { connection } = require('./modules/gateway/connection.gateway');
const swaggerDocument = YAML.load(`${__dirname}/swagger.yaml`);
// checkOverload();

//# INIT ROUTES
app.use('/api', require('./routes'));

//# global variable
global._io = io;
//# INIT SOCKET
global._io.on('connection', connection);

//# SWAGGER
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

module.exports = http;
