// app/api/news/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongoose";
import News from '../../../../models/News';

import mongoose from 'mongoose';
import { syncToKnowledgeBase, removeFromKnowledgeBase } from '../../../../services/api/syncService';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const news = await News.findById(params.id).lean();
  if (!news) return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
  return NextResponse.json(news);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const news = await News.findByIdAndUpdate(params.id, data, { new: true, session });
      if (!news) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
      }

      await syncToKnowledgeBase(
        news._id.toString(),
        'News',
        news.title,
        news.content,
        session
      );

      await session.commitTransaction();
      session.endSession();
      
      return NextResponse.json(news);
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Gagal update berita' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const news = await News.findByIdAndDelete(params.id, { session });
      if (!news) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
      }

      await removeFromKnowledgeBase(params.id, session);

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({ message: 'Berita berhasil dihapus' });
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Gagal menghapus berita' }, { status: 500 });
  }
}
