import React from "react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm w-16 h-10">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
};
