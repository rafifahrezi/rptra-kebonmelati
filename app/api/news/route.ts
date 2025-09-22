// app/api/news/route.ts
import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongoose";
import News from '../../../models/News';

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

    const news = new News(data);
    await news.save();

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat berita' }, { status: 500 });
  }
}
