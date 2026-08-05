import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '../services/chatbotService';
import { IConversation } from '../types/conversation';

export const useConversation = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [history, setHistory] = useState<IConversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    // Generate or get local sessionId
    let id = localStorage.getItem('chat_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chat_session_id', id);
    }
    setSessionId(id);
    
    // Load history
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);
        const res = await getHistory(id as string);
        if (res.success && res.history) {
          setHistory(res.history);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, []);

  const addMessageToLocalHistory = useCallback((msg: IConversation) => {
    setHistory(prev => [...prev, msg]);
  }, []);

  return { sessionId, history, loadingHistory, addMessageToLocalHistory };
};
