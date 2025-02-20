import React from 'react';
import { X, MessageSquare, Plus, Search, Settings } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSessionSelect, 
  onNewChat, 
  onClose 
}) => {
  return (
    <div className="h-full bg-[#1E1E1E] border-r border-[#39AEA9]/20">
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-[#39AEA9]/20">
          <h2 className="text-[#E5EFC1] font-semibold text-lg">AI Advisor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#39AEA9]/10 rounded-xl lg:hidden transition-colors duration-200"
          >
            <X className="w-5 h-5 text-[#A2D5AB]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 ${
                session.id === currentSessionId
                  ? 'bg-[#39AEA9]/20 text-[#E5EFC1]'
                  : 'text-[#557B83] hover:bg-[#39AEA9]/10'
              }`}
            >
              <div className="font-medium">{session.name}</div>
              <div className="text-sm text-[#557B83]">
                {new Date(session.timestamp).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[#39AEA9]/20 space-y-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#A2D5AB] to-[#39AEA9] text-[#1E1E1E] px-4 py-3 rounded-xl hover:opacity-90 transition-opacity duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;