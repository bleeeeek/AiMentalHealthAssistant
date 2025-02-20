export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  apiMessages: Array<{ role: 'user' | 'assistant', content: any }>;
  timestamp: Date;
}