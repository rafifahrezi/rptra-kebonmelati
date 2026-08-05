import { NextResponse } from 'next/server';
import { searchRelevantDocuments } from '../../../services/api/vectorSearchService';
import { generateEmbedding } from '../../../services/api/embeddingService';
import connectDB from '../../../lib/mongoose';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { query, limit } = await req.json();

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const queryEmbedding = await generateEmbedding(query);
    const results = await searchRelevantDocuments(queryEmbedding, limit);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Vector Search API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
