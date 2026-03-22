import { storageKeys } from '../hooks/useLocalStorage';

/**
 * Direct call to Groq or OpenAI API from frontend.
 * Note: In a production environment, this should be routed through a backend to protect the API key.
 * For this isolated study tool, we prompt the user for their key and store it locally.
 */
export async function callAI(systemPrompt, userPrompt, jsonMode = false) {
  // 1. Get Settings
  const apiKey = localStorage.getItem(storageKeys.API_KEY)?.replace(/^"|"$/g, '');
  const provider = localStorage.getItem(storageKeys.AI_PROVIDER)?.replace(/^"|"$/g, '') || 'groq';

  if (!apiKey) {
    throw new Error('API_KEY_REQUIRED');
  }

  // 2. Prepare Endpoint & Payload
  let endpoint = '';
  let model = '';
  let maxTokens = 3000;

  if (provider === 'groq') {
    endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    model = 'llama-3.3-70b-versatile'; 
  } else {
    endpoint = 'https://api.openai.com/v1/chat/completions';
    model = 'gpt-4o-mini';
  }

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3, // Lower temp for more factual academic responses
    max_tokens: maxTokens,
  };

  // Enforce JSON Mode if requested
  if (jsonMode) {
    if (provider === 'openai') {
      payload.response_format = { type: 'json_object' };
    }
  }

  // 3. Make the API Call
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload)
    });

    // Handle Unauthorized
    if (response.status === 401) {
      throw new Error('INVALID_API_KEY');
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // 4. Return or Parse JSON
    if (jsonMode) {
      try {
        // Strip markdown blocks if the model awkwardly wrapped the JSON
        // Using a more robust regex to find the first [ and last ]
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          content = jsonMatch[0];
        } else {
          content = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
        }
        return JSON.parse(content);
      } catch (e) {
        console.error("AI returned malformed JSON:", content);
        throw new Error('AI returned an invalid JSON format. Please try again.');
      }
    }

    return content;
    
  } catch (error) {
    console.error("AI API Error:", error);
    throw error;
  }
}
