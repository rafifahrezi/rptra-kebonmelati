import { useState, useCallback } from 'react';
import { sendMessage } from '../services/chatbotService';

export const useChatbot = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendUserMessage = useCallback(async (message: string, sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendMessage(message, sessionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }
      return { answer: response.answer, link: response.link, linkText: response.linkText };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendUserMessage, loading, error };
};
