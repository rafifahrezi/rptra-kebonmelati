import { NextRequest, NextResponse } from "next/server";
import VideoModel from "@/models/Video";
import connectDB from "@/lib/mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const video = await VideoModel.findById(params.id).lean().exec();
    if (!video) {
      return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json({ error: "Gagal memuat video" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Format tanggal harus YYYY-MM-DD" }, { status: 400 });
    }

    const video = await VideoModel.findByIdAndUpdate(
      params.id,
      { titleVidio, deskripsi: deskripsi || undefined, date, youtubeUrl },
      { new: true, runValidators: true }
    ).lean();

    if (!video) {
      return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error: any) {
    console.error("Error updating video:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(", ");
      return NextResponse.json({ error: `Validasi gagal: ${messages}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui video" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const video = await VideoModel.findByIdAndDelete(params.id).lean();
    if (!video) {
      return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ message: "Video berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Gagal menghapus video" }, { status: 500 });
  }
}