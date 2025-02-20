import React, { useState } from 'react';
import { Menu, Send, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatMessage, ChatSession } from './types';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import Sidebar from './components/Sidebar';
import { analyzeImage, sendChatMessage } from './services/imageAnalysis';

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([{
    id: 'default',
    name: 'New Chat',
    messages: [{
      id: 1,
      text: "Hi there! I can help you analyze images and answer questions. Try uploading an image!",
      sender: 'assistant',
      timestamp: new Date(),
    }],
    apiMessages: [],
    timestamp: new Date()
  }]);
  
  const [currentSessionId, setCurrentSessionId] = useState('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId)!;

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: 'New Chat',
      messages: [{
        id: 1,
        text: "Hi there! I can help you analyze images and answer questions. Try uploading an image!",
        sender: 'assistant',
        timestamp: new Date(),
      }],
      apiMessages: [],
      timestamp: new Date()
    };
    
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates }
        : session
    ));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    updateSession(currentSessionId, {
      messages: [...currentSession.messages, userMessage],
      apiMessages: [...currentSession.apiMessages, { role: 'user', content: text }]
    });

    try {
      const response = await sendChatMessage(
        text, 
        currentSession,
        sessions // Pass all sessions for context
      );
      
      updateSession(currentSessionId, {
        messages: [...currentSession.messages, userMessage, {
          id: Date.now(),
          text: response,
          sender: 'assistant',
          timestamp: new Date(),
        }],
        apiMessages: [...currentSession.apiMessages, 
          { role: 'user', content: text },
          { role: 'assistant', content: response }
        ]
      });
    } catch (error) {
      console.error('Error getting response:', error);
      updateSession(currentSessionId, {
        messages: [...currentSession.messages, userMessage, {
          id: Date.now(),
          text: 'Sorry, there was an error processing your message.',
          sender: 'assistant',
          timestamp: new Date(),
        }]
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsAnalyzing(true);

      const uploadMessage: ChatMessage = {
        id: Date.now(),
        text: '📷 Image uploaded, analyzing...',
        sender: 'user',
        timestamp: new Date(),
      };

      updateSession(currentSessionId, {
        messages: [...currentSession.messages, uploadMessage]
      });

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const analysis = await analyzeImage(
        base64, 
        currentSession,
        sessions // Pass all sessions for context
      );
      
      updateSession(currentSessionId, {
        messages: [...currentSession.messages, uploadMessage, {
          id: Date.now(),
          text: analysis,
          sender: 'assistant',
          timestamp: new Date(),
        }],
        apiMessages: [...currentSession.apiMessages,
          { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` }}] },
          { role: 'assistant', content: analysis }
        ]
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      updateSession(currentSessionId, {
        messages: [...currentSession.messages, {
          id: Date.now(),
          text: 'Sorry, there was an error analyzing the image. Please try again.',
          sender: 'assistant',
          timestamp: new Date(),
        }]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1E1E1E]">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-72`}
      >
        <Sidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionSelect={setCurrentSessionId}
          onNewChat={createNewChat}
          onClose={() => setIsSidebarOpen(false)} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="bg-[#1E1E1E] p-4 flex items-center justify-between border-b border-[#39AEA9]/20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-[#39AEA9]/10 rounded-xl lg:hidden transition-colors duration-200"
          >
            <Menu className="w-6 h-6 text-[#E5EFC1]" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#A2D5AB] to-[#39AEA9] flex items-center justify-center shadow-lg">
              <span className="text-[#1E1E1E] font-semibold text-lg">AI</span>
            </div>
            <div>
              <h1 className="text-[#E5EFC1] font-semibold text-lg">AI Advisor</h1>
              <p className="text-[#557B83]">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-[#39AEA9]/10 rounded-xl transition-colors duration-200">
            <MoreVertical className="w-6 h-6 text-[#E5EFC1]" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-[#1E1E1E]">
          <MessageList messages={currentSession.messages} />
        </div>

        {/* Input Area */}
        <div className="bg-[#1E1E1E] border-t border-[#39AEA9]/20 p-4">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            onImageUpload={handleImageUpload}
            disabled={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
}

export default App;