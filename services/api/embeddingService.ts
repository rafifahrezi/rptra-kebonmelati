import { CHATBOT_CONFIG } from '../../constants/config';
import { VoyageAIClient } from 'voyageai';

export const generateEmbedding = async (text: string, modelName: string = CHATBOT_CONFIG.EMBEDDING_MODEL): Promise<number[]> => {
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY is not set in the environment variables');
  }

  try {
    const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
    const response = await voyageClient.embed({
      input: text,
      model: modelName,
    });
    
    // voyageai SDK returns data as an array in response.data, similar to the API
    return response.data?.[0]?.embedding || [];
  } catch (error: any) {
    console.error('Error generating embedding with Voyage AI:', error?.response?.data || error?.message || error);
    throw new Error('Failed to generate embedding: ' + (error?.message || ''));
  }
};

export const generateEmbeddingsBatch = async (texts: string[], modelName: string = CHATBOT_CONFIG.EMBEDDING_MODEL): Promise<number[][]> => {
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY is not set in the environment variables');
  }
  if (texts.length === 0) return [];
  try {
    const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
    
    const response = await voyageClient.embed({
      input: texts,
      model: modelName,
    });
    
    return (response.data || []).map((item: any) => item.embedding);
  } catch (error: any) {
    console.error('Error generating embeddings batch with Voyage AI:', error?.response?.data || error?.message || error);
    throw new Error('Failed to generate embeddings batch: ' + (error?.message || ''));
  }
};

