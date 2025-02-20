import React from 'react';
import { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-[#A2D5AB] to-[#39AEA9] text-[#1E1E1E]'
                : 'bg-[#39AEA9]/10 text-[#E5EFC1]'
            }`}
          >
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.text}</p>
            <div
              className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-[#1E1E1E]/70' : 'text-[#557B83]'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;