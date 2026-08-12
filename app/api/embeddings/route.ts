import { NextResponse } from 'next/server';
import { generateEmbedding } from '../../../services/api/embeddingService';
import { saveKnowledge } from '../../../services/api/mongoService';
import { chunkText } from '../../../utils/chunkText';
import { CHATBOT_CONFIG } from '../../../constants/config';
import connectDB from '../../../lib/mongoose';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, category, content } = await req.json();

    if (!title || !category || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const chunks = chunkText(content, CHATBOT_CONFIG.CHUNK_SIZE, CHATBOT_CONFIG.CHUNK_OVERLAP);
    const savedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkTitle = chunks.length > 1 ? `${title} (Part ${i + 1})` : title;
      const embedding = await generateEmbedding(chunks[i]);
      const saved = await saveKnowledge(chunkTitle, category, chunks[i], embedding);
      savedChunks.push(saved);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ingested ${chunks.length} chunks`,
      chunks: savedChunks.length
    });
  } catch (error) {
    console.error('Embedding API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
