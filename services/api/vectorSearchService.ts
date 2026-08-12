import { KnowledgeModel } from '../../models/Knowledge';
import { CHATBOT_CONFIG } from '../../constants/config';

export interface VectorSearchResult {
  title: string;
  category: string;
  content: string;
  score: number;
}

export const searchRelevantDocuments = async (
  queryEmbedding: number[],
  limit: number = CHATBOT_CONFIG.VECTOR_SEARCH_LIMIT
): Promise<VectorSearchResult[]> => {
  try {
    const results = await KnowledgeModel.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Harus sama nama_index yang ada di MongoDB Atlas
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 10,
          limit: limit,
        }
      },
      {
        $project: {
          _id: 0,
          title: 1,
          category: 1,
          content: 1,
          score: { $meta: "vectorSearchScore" }
        }
      },
      {
        $match: {
          score: { $gte: CHATBOT_CONFIG.SIMILARITY_THRESHOLD }
        }
      }
    ]);

    return results as VectorSearchResult[];
  } catch (error) {
    console.error('Vector Search failed:', error);
    throw new Error('Failed to search relevant documents');
  }
};
