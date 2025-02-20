import { ChatSession } from '../types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | {
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }[];
}

function extractRelevantContext(allSessions: ChatSession[], currentSessionId: string): ChatMessage[] {
  const contextMessages: ChatMessage[] = [
    {
      role: 'system',
      content: import.meta.env.VITE_SYSTEM_PROMPT
    }
  ];
  
  // Get last 3 relevant exchanges from other chats
  allSessions
    .filter(session => session.id !== currentSessionId)
    .forEach(session => {
      const relevantMessages = session.apiMessages
        .filter((msg: { content: any }) => {
          // Filter out image-only messages and keep text interactions
          const content = msg.content;
          return typeof content === 'string' || (Array.isArray(content) && content.some(c => c.type === 'text'));
        })
        .slice(-6); // Take last 3 exchanges (3 user + 3 assistant messages)
      
      contextMessages.push(...relevantMessages);
    });

  // Add a context separator
  if (contextMessages.length > 0) {
    contextMessages.push({
      role: 'system',
      content: "The above messages are from previous conversations for context. Below is the current conversation:"
    });
  }

  return contextMessages;
}

export async function sendChatMessage(
  message: string,
  currentSession: ChatSession,
  allSessions: ChatSession[]
): Promise<string> {
  try {
    const contextMessages = extractRelevantContext(allSessions, currentSession.id);
    const messages = [
      ...contextMessages,
      ...currentSession.apiMessages,
      { role: 'user', content: message }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "localhost:5173",
        "X-Title": import.meta.env.VITE_APP_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen-vl-plus:free",
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function analyzeImage(
  imageBase64: string,
  currentSession: ChatSession,
  allSessions: ChatSession[]
): Promise<string> {
  try {
    const contextMessages = extractRelevantContext(allSessions, currentSession.id);
    const imageMessage = {
      role: "user",
      content: [
        {
          type: "text",
          text: "What is in this image? Please reference any relevant information from our previous conversations if applicable."
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    };

    const messages = [...contextMessages, ...currentSession.apiMessages, imageMessage];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "localhost:5173",
        "X-Title": import.meta.env.VITE_APP_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen-vl-plus:free",
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
} 