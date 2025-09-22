import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Gallery from "@/models/Gallery";

interface GalleryRequestBody {
  title: string;
  description?: string;
  category: string;
  date: string;
  status?: "draft" | "published" | "archived";
  images?: string[];
}

// ✅ Ambil detail gallery by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const gallery = await Gallery.findById(params.id).lean();
    if (!gallery) {
      return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(gallery);
  } catch (err) {
    console.error("API Error (GET):", err);
    return NextResponse.json({ error: "Gagal mengambil galeri" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const data: GalleryRequestBody = await request.json();

    const updatedGallery = await Gallery.findByIdAndUpdate(
      params.id,
      {
        $set: {
          title: data.title?.trim(),
          description: data.description?.trim(),
          category: data.category?.trim(),
          date: new Date(data.date),
          status: data.status || "draft",
          images: Array.isArray(data.images) ? data.images : [],
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedGallery) {
      return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updatedGallery);
  } catch (err) {
    console.error("API Error (PUT):", err);
    return NextResponse.json({ error: "Gagal memperbarui galeri" }, { status: 500 });
  }
}

// ✅ Hapus gallery by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const deletedGallery = await Gallery.findByIdAndDelete(params.id).lean();
    if (!deletedGallery) {
      return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ message: "Galeri berhasil dihapus" });
  } catch (err) {
    console.error("API Error (DELETE):", err);
    return NextResponse.json({ error: "Gagal menghapus galeri" }, { status: 500 });
  }
}
