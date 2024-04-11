const { logger } = require("../../common/helpers/logger");
const { sendMessage } = require("../chat/chat.repo");

const chatEvent = async (socket, userId) => {

    try {
        socket.on('join-conversation', async ({ conversationId }) => {
            socket.join(conversationId);
            console.log("🚀 ~ socket.on ~ conversationId:::", conversationId);
        });
        socket.on('send-message', async ({ conversationId, message }) => {
            try {
                const newMessage = {
                    sender: userId,
                    text: message
                }
                const conversation = await sendMessage({ conversationId: conversationId, newMessage })
                global._io.in(conversation._id.toString()).emit('update-messages', { messages: conversation.messages })
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
