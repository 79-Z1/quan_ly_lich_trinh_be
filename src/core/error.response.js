'use strict'
const { StatusCodes, ReasonPhrases } = require('../utils/httpStatusCode')


class ErrorResponse extends Error {
    constructor(message, status, statusCode) {
        super(message)
        this.status = status
        this.statusCode = statusCode;
    }
}

class ConflicRequestError extends ErrorResponse {
    constructor(message, status = ReasonPhrases.CONFLICT, statusCode = StatusCodes.FORBIDDEN) {
        super(message, status, statusCode)
    }
}

class BadrequestError extends ErrorResponse {
    constructor(message, status = ReasonPhrases.BAD_REQUEST, statusCode = StatusCodes.BAD_REQUEST) {
        super(message, status, statusCode)
    }
}

class AuthFailurError extends ErrorResponse {
    constructor(message, status = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED) {
        super(message, status, statusCode)
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message, status = ReasonPhrases.NOT_FOUND, statusCode = StatusCodes.NOT_FOUND) {
        super(message, status, statusCode)
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message, status = ReasonPhrases.FORBIDDEN, statusCode = StatusCodes.FORBIDDEN) {
        super(message, status, statusCode)
    }
}

module.exports = {
    ConflicRequestError,
    BadrequestError,
    AuthFailurError,
    NotFoundError,
    ForbiddenError
};
