import React from "react";
import Link from "next/link";
import { Bot, User } from "lucide-react";

export interface MessageProps {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  link?: string;
  linkText?: string;
}

export const ChatMessage: React.FC<{ message: MessageProps }> = ({ message }) => {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex w-full mb-4 ${isBot ? "justify-start" : "justify-end"}`}>
      <div className={`flex max-w-[85%] ${isBot ? "flex-row" : "flex-row-reverse"}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-auto mb-1">
          {isBot ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-2">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className="flex flex-col">
          <div
            className={`p-3 text-sm rounded-2xl shadow-sm ${
              isBot
                ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700"
                : "bg-emerald-500 text-white rounded-br-sm"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.text}</p>
            
            {/* Optional Link Button */}
            {message.link && message.linkText && (
              <div className="mt-3">
                {message.link.startsWith("http") ? (
                  <a
                    href={message.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 font-medium text-xs rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    {message.linkText}
                  </a>
                ) : (
                  <Link
                    href={message.link}
                    className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 font-medium text-xs rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    {message.linkText}
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <span className={`text-[10px] text-gray-400 mt-1 ${isBot ? "text-left ml-1" : "text-right mr-1"}`}>
            {message.timestamp}
          </span>
        </div>

      </div>
    </div>
  );
};
