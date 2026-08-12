import { NextResponse, NextRequest } from 'next/server';
import { processRAGQuery } from '../../../services/api/ragService';
import { saveMessage, getConversationHistory } from '../../../services/api/memoryService';
import { FALLBACK_MESSAGE } from '../../../constants/messages';
import connectDB from '@/lib/mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json({ success: false, error: 'Message and sessionId are required' }, { status: 400 });
    }

    // Save user message
    await saveMessage(sessionId, 'user', message);

    try {
      // Process query using RAG
      let answer = await processRAGQuery(message, sessionId);
      
      let link = undefined;
      let linkText = undefined;
      
      if (answer.includes('[CONTACT_ADMIN]')) {
        answer = answer.replace('[CONTACT_ADMIN]', '').trim();
        link = 'https://wa.me/6281234567890';
        linkText = 'Hubungi Admin via WhatsApp';
      } else if (answer.includes('[OPEN_MAPS]')) {
        answer = answer.replace('[OPEN_MAPS]', '').trim();
        link = 'https://maps.google.com/?q=RPTRA+Kebon+Melati+Jakarta+Pusat';
        linkText = 'Buka Google Maps';
      }

      // Save bot response
      await saveMessage(sessionId, 'model', answer, link, linkText);

      return NextResponse.json({ success: true, answer, link, linkText });
    } catch (ragError) {
      console.error('RAG process failed:', ragError);
      
      // Save and return fallback message
      await saveMessage(sessionId, 'model', FALLBACK_MESSAGE);
      return NextResponse.json({ success: true, answer: FALLBACK_MESSAGE });
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    const history = await getConversationHistory(sessionId);
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
