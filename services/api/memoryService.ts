import { ConversationModel } from '../../models/Conversation';
import { CHATBOT_CONFIG } from '../../constants/config';

export const getConversationHistory = async (sessionId: string, limit: number = CHATBOT_CONFIG.MAX_MEMORY_MESSAGES) => {
  try {
    const history = await ConversationModel.find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return history.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
};

export const saveMessage = async (sessionId: string, role: 'user' | 'model', message: string, link?: string, linkText?: string) => {
  try {
    await ConversationModel.create({ sessionId, role, message, link, linkText });
  } catch (error) {
    console.error('Error saving message:', error);
  }
};
