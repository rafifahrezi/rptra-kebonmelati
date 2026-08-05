import { KnowledgeModel } from '../../models/Knowledge';
import { VoyageAIClient } from 'voyageai';
import connectDB from '../../lib/mongoose';

export const saveKnowledge = async (
  title: string,
  category: string,
  content: string,
  embedding: number[]
) => {
  try {
    const knowledge = new KnowledgeModel({
      title,
      category,
      content,
      embedding
    });
    await knowledge.save();
    return knowledge;
  } catch (error) {
    console.error('Error saving knowledge:', error);
    throw new Error('Failed to save knowledge to MongoDB');
  }
};

// Contoh integrasi Voyage AI + MongoDB (seperti yang diminta)
export async function saveNewsWithEmbedding(title: string, content: string) {
  if (!process.env.VOYAGE_API_KEY) throw new Error('VOYAGE_API_KEY is missing');
  
  const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
  const db = (await connectDB()).connection.db;
  
  if (!db) throw new Error('Database connection failed');

  // 1. Minta Voyage AI untuk mengubah teks berita menjadi angka Vektor
  const response = await voyageClient.embed({
    input: `${title} ${content}`,
    model: "voyage-multilingual-2" // Menghasilkan 1024 dimensi
  });
  
  const vectorAngka = response.data?.[0]?.embedding || [];

  // 2. Simpan berita tersebut beserta vektornya ke MongoDB (Bring your own embedding)
  await db.collection('news').insertOne({
    title: title,
    content: content,
    embedding: vectorAngka // Field ini yang akan dicari oleh Atlas Vector Search
  });
  
  return true;
}
