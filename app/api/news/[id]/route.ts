// app/api/news/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongoose";
import News from '../../../../models/News';

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
    const news = await News.findByIdAndUpdate(params.id, data, { new: true });
    if (!news) return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update berita' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const news = await News.findByIdAndDelete(params.id);
    if (!news) return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ message: 'Berita berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus berita' }, { status: 500 });
  }
}
