const { StatusCodes, ReasonPhrases } = require('../utils/httpStatusCode');

class SuccessResponse {
    constructor({ message, statusCode = StatusCodes.OK, reasonPhrases = ReasonPhrases.OK, metadata = {} }) {
        this.message = !message ? reasonPhrases : message;
        this.statusCode = statusCode;
        this.metadata = metadata;
    }

    send(res, headers = {}) {
        return res.status(this.statusCode).json(this);
    } c
}

class OK extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, metadata });
    }
}

class CREATED extends SuccessResponse {
    constructor({ message = ReasonPhrases.CREATED, statusCode = StatusCodes.CREATED, reasonPhrases = ReasonPhrases.CREATED, metadata, options = {} }) {
        super({ message, statusCode, reasonPhrases, metadata });
        this.options = options;
    }
}

class ACCEPTED extends SuccessResponse {
    constructor({ message = ReasonPhrases.ACCEPTED, statusCode = StatusCodes.ACCEPTED, reasonPhrases = ReasonPhrases.ACCEPTED, metadata }) {
        super({ message, statusCode, reasonPhrases, metadata });
    }
}

module.exports = {
    OK, CREATED, ACCEPTED, SuccessResponse
};

