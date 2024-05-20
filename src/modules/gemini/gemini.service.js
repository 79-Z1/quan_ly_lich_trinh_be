'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chatRepo = require("../chat/chat.repo");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


class GeminiService {
    static askGemini = async ({ prompt, conversationId, userId }) => {
        try {
            logger.info(`GeminiService -> askGemini [START]\n(INPUT) ${handleObject({ prompt, conversationId })}`)
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const newAsk = {
                sender: userId,
                text: prompt
            }
            const [result] = await Promise.all([
                await model.generateContent(prompt),
                await chatRepo.sendMessage({ conversationId, newMessage: newAsk })
            ])
            const response = await result.response;
            const text = response.text();
            const newMessage = {
                sender: '66462c81d7811ee594954405',
                text: text
            }
            const messages = await chatRepo.sendMessage({ conversationId, newMessage: newMessage })

            logger.info(`GeminiService -> askGemini [END]\n(OUTPUT) ${handleObject({ text: text })}`)
            return messages;
        } catch (error) {
            console.log("🚀 ~ GeminiService ~ askGemini= ~ error:::", error);
            throw new BadrequestError('Ask gemini failed')
        }
    }
}

module.exports = GeminiService;
