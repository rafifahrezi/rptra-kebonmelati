export const sendMessage = async (message: string, sessionId: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!response.ok) throw new Error('API Error');
  return response.json();
};

export const getHistory = async (sessionId: string) => {
  const response = await fetch(`/api/chat?sessionId=${sessionId}`);
  if (!response.ok) throw new Error('API Error');
  return response.json();
};

export const clearHistory = () => {
  localStorage.removeItem('chat_session_id');
};
