// app/api/news/route.ts
import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import News from '../../../models/News';
import { syncToKnowledgeBase } from '../../../services/api/syncService';

// GET /api/news -> Get all berita (optional filter dan search bisa ditambahkan)
export async function GET() {
  await dbConnect();
  const newsList = await News.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(newsList);
}

// POST /api/news -> Create berita baru
export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.title || !data.content) {
      return NextResponse.json({ error: 'Title dan content wajib diisi' }, { status: 400 });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const news = new News(data);
      await news.save({ session });

      // Dual-write to knowledge_base
      await syncToKnowledgeBase(
        news._id.toString(),
        'News',
        news.title,
        news.content,
        session
      );

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(news, { status: 201 });
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Gagal membuat berita' }, { status: 500 });
  }
}
