import React, { useState, useRef, useEffect } from "react";
import { Send, X, MinusSquare, Trash2 } from "lucide-react";
import { ChatMessage, MessageProps } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { useChatbot } from "../../hooks/useChatbot";
import { useConversation } from "../../hooks/useConversation";
import { clearHistory as clearApiHistory } from "../../services/chatbotService";

interface ChatWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, onMinimize }) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sessionId, history, loadingHistory, addMessageToLocalHistory } = useConversation();
  const { sendUserMessage, loading, error } = useChatbot();

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || !sessionId) return;

    const userText = text.trim();
    setInputValue("");

    // Optimistic local update
    addMessageToLocalHistory({
      sessionId,
      role: 'user',
      message: userText,
      timestamp: new Date()
    });

    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));

    const result = await sendUserMessage(userText, sessionId);

    if (result && result.answer) {
      addMessageToLocalHistory({
        sessionId,
        role: 'model',
        message: result.answer,
        link: result.link,
        linkText: result.linkText,
        timestamp: new Date()
      });
    }
  };

  const handleClearChat = () => {
    clearApiHistory();
    // Force reload by refreshing the window or resetting state
    window.location.reload();
  };

  const suggestions = ["Jadwal", "Booking", "Galeri", "Kontak", "Berita"];

  const displayMessages: MessageProps[] = history.map((msg, index) => ({
    id: msg._id || `local-${index}`,
    sender: msg.role === 'user' ? 'user' : 'bot',
    text: msg.message,
    link: msg.link,
    linkText: msg.linkText,
    timestamp: msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  // Add welcome message if history is empty and not loading
  if (!loadingHistory && displayMessages.length === 0) {
    displayMessages.push({
      id: "welcome",
      sender: "bot",
      text: "Halo Kak! 👋 Ada yang bisa saya bantu terkait RPTRA?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  return (
    <div className="flex flex-col h-[500px] w-full bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-emerald-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
              R
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Asisten RPTRA</h3>
            <p className="text-xs text-emerald-100">{loadingHistory ? 'Memuat...' : 'Online'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleClearChat} className="p-1 hover:bg-emerald-700 rounded-md transition-colors" title="Hapus Obrolan">
            <Trash2 size={16} />
          </button>
          <button onClick={onMinimize} className="p-1 hover:bg-emerald-700 rounded-md transition-colors" title="Minimize">
            <MinusSquare size={18} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-md transition-colors" title="Tutup">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {displayMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex w-full mb-4 justify-start">
            <div className="max-w-[85%] flex-row">
              <TypingIndicator />
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-xs text-red-500 my-2">
            Terjadi kesalahan: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {displayMessages.length <= 1 && !loading && (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar">
          {suggestions.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 bg-gray-50 dark:bg-gray-900 text-sm px-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            disabled={loadingHistory || loading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading || loadingHistory}
            className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};
