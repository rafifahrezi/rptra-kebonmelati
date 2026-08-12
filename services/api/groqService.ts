import { groq } from '../../lib/groq';
import { CHATBOT_CONFIG } from '../../constants/config';

export const generateContent = async (systemPrompt: string, userPrompt: string, modelName: string = CHATBOT_CONFIG.GENERATION_MODEL): Promise<string> => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      model: modelName,
      temperature: 0.1, // Strict determinism for RAG
      max_tokens: 1024,
      top_p: 0.9,
    });
    
    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating content with Groq:', error);
    throw new Error('Failed to generate content');
  }
};
