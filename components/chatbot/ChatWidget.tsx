"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-[88px] right-6 z-50 transition-all duration-300 ease-in-out origin-bottom-right ${isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        style={{ width: "min(380px, calc(100vw - 32px))" }}
      >
        <ChatWindow
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsOpen(false)}
        />
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center ${isOpen
            ? "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105"
            : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 hover:shadow-2xl animate-bounce"
          }`}
        style={{
          animation: !isOpen ? "bounce 2s infinite" : "none",
        }}
        aria-label="Toggle Chat"
      >
        <MessageCircle size={28} />
      </button>
    </>
  );
};

