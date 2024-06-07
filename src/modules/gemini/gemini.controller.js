'use strict';
const { SuccessResponse } = require("../../common/core/success.response");
const GeminiionService = require("./gemini.service");

class GeminiController {

    askGemini = async (req, res) => {
        new SuccessResponse({
            message: 'Ask gemini successfully',
            metadata: await GeminiionService.askGemini({
                userId: req.user.userId,
                prompt: req.body.prompt,
                conversationId: req.body.conversationId
            })
        }).send(res);
    }

    getAISuggestion = async (req, res) => {
        new SuccessResponse({
            message: 'Get AI suggestion successfully',
            metadata: await GeminiionService.getAISuggestion(req.user.name, req.body.location)
        }).send(res);
    }

}

module.exports = new GeminiController();