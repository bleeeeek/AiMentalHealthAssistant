import React, { useState, useRef } from 'react';
import { Send, Image } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onImageUpload: (file: File) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onImageUpload, disabled }) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 hover:bg-[#39AEA9]/10 rounded-xl transition-colors duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        >
          <Image className="w-5 h-5 text-[#A2D5AB]" />
        </button>
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? "Analyzing..." : "Ask anything..."}
        className="flex-1 bg-[#39AEA9]/10 text-[#E5EFC1] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#39AEA9]/50 placeholder-[#557B83] transition-all duration-200"
        disabled={disabled}
      />
      <button
        type="submit"
        className={`p-3 bg-gradient-to-r from-[#A2D5AB] to-[#39AEA9] rounded-xl hover:opacity-90 transition-opacity duration-200 shadow-lg ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled}
      >
        <Send className="w-5 h-5 text-[#1E1E1E]" />
      </button>
    </form>
  );
};

export default ChatInput;