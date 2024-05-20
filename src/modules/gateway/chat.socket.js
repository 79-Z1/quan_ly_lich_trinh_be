const { logger } = require("../../common/helpers/logger");
const { sendMessage, getMessages } = require("../chat/chat.repo");

const chatEvent = async (socket, chatNamespace) => {

    try {
        socket.on('join-conversation', async ({ conversationId }) => {
            socket.join(conversationId);
            const messages = await getMessages(conversationId);
            chatNamespace.in(conversationId).emit('update-messages', { messages: messages })
        });
        socket.on('send-message', async ({ userId, conversationId, message }) => {
            try {
                const newMessage = {
                    sender: userId,
                    text: message
                }
                const messages = await sendMessage({ conversationId: conversationId, newMessage })
                chatNamespace.in(conversationId).emit('update-messages', { messages: messages })
            } catch (error) {
                console.log(error);
            }
        });
    } catch (error) {
        logger.error(`Socket chat error:::`, err);
    }
}

module.exports = {
    chatEvent
};
