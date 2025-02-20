interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | {
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }[];
}

export async function analyzeImage(imageBase64: string, question?: string): Promise<string> {
  const messages: ChatMessage[] = [];

  // Add image context
  const imageContext: ChatMessage = {
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`
        }
      }
    ]
  };
  messages.push(imageContext);

  // Add question if provided
  if (question) {
    messages.push({
      role: 'user',
      content: question
    });
  } else {
    // Default analysis prompt
    messages.push({
      role: 'user',
      content: "Please analyze this image and describe what you see in detail."
    });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "HTTP-Referer": import.meta.env.VITE_APP_NAME,
      "X-Title": import.meta.env.VITE_APP_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "qwen/qwen-vl-plus:free",
      "messages": messages
    })
  });

  const result = await response.json();
  return result.choices[0].message.content;
} 