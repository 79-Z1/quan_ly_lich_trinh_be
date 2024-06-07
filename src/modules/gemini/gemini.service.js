'use strict';

const { BadrequestError } = require("../../common/core/error.response");
const { logger } = require("../../common/helpers/logger");
const { handleObject } = require("../../common/utils");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chatRepo = require("../chat/chat.repo");
const { prompt } = require("../../common/utils/ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


class GeminiService {
    static askGemini = async ({ prompt, conversationId, userId }) => {
        try {
            logger.info(`GeminiService -> askGemini [START]\n(INPUT) ${handleObject({ prompt, conversationId })}`);

            // Get conversation history
            const conversationHistory = await chatRepo.getConversationHistory(conversationId);
            const history = conversationHistory.map(message => ({
                role: message.sender._id.toString() === userId ? "user" : "model",
                parts: [{ text: message.text }]
            }));

            // Add user's message to history
            history.push({
                role: "user",
                parts: [{ text: prompt }]
            });

            // Generate model
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 100,
                },
            });

            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();

            const userMessage = {
                sender: userId,
                text: prompt
            };
            await chatRepo.sendMessage({ conversationId, newMessage: userMessage });

            const modelMessage = {
                sender: '66462c81d7811ee594954405',
                text: text
            };
            const messages = await chatRepo.sendMessage({ conversationId, newMessage: modelMessage });

            logger.info(`GeminiService -> askGemini [END]\n(OUTPUT) ${handleObject({ text: text })}`);
            return messages;
        } catch (error) {
            throw new BadrequestError('Ask gemini failed');
        }
    }

    static getAISuggestion = async (name, location = { lat: 0, lng: 0 }) => {
        try {
            logger.info(`GeminiService -> getAISuggestions [START]\n(INPUT) ${handleObject({ name })}`);
            const promptFormat = prompt(name, `lat:${location.lat}, lng:${location.lng}`);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(promptFormat);

            const response = result.response;
            const text = response.text();

            logger.info(`GeminiService -> getAISuggestions [END]\n(OUTPUT) ${handleObject({ text: text })}`)
            return text;
        } catch (error) {
            throw new BadrequestError('getAISuggestions failed')
        }
    }
}

module.exports = GeminiService;
