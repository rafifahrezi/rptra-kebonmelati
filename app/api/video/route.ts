import { NextRequest, NextResponse } from "next/server";
import VideoModel from "@/models/Video";
import connectDB from "@/lib/mongoose";

export async function GET() {
  try {
    await connectDB();
    const videos = await VideoModel.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Gagal memuat video" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { titleVidio, deskripsi, date, youtubeUrl } = await request.json();

    // Validate required fields
    if (!titleVidio || !date || !youtubeUrl) {
      return NextResponse.json({ error: "Judul, tanggal, dan URL YouTube wajib diisi" }, { status: 400 });
    }

    // Validate YouTube URL format
    const isValidYouTubeUrl = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/.test(youtubeUrl);
    if (!isValidYouTubeUrl) {
      return NextResponse.json({ error: "URL YouTube tidak valid, harus dalam format embed" }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Format tanggal harus YYYY-MM-DD" }, { status: 400 });
    }

    const video = new VideoModel({
      titleVidio,
      deskripsi: deskripsi || undefined, // Allow optional deskripsi
      date,
      youtubeUrl,
    });

    const savedVideo = await video.save();
    return NextResponse.json(savedVideo, { status: 201 });
  } catch (error: any) {
    console.error("Error creating video:", error);
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(", ");
      return NextResponse.json({ error: `Validasi gagal: ${messages}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat video" }, { status: 500 });
  }
}