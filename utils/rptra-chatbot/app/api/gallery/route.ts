// app/api/gallery/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Gallery, { IGalleries } from "@/models/Gallery";

export async function GET() {
  await dbConnect();
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(galleries, { status: 200 });
  } catch (error) {
    console.error("GET galleries error:", error);
    return NextResponse.json({ error: "Gagal mengambil data gallery" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { title, description, date, category, status, images } = body;

    // Validasi field wajib (mirip Events)
    const requiredFields = ["title", "date", "category"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} wajib diisi` }, { status: 400 });
      }
    }

    // Validasi title dan category (trim dan non-empty)
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title harus string non-kosong" }, { status: 400 });
    }
    if (typeof category !== "string" || !category.trim()) {
      return NextResponse.json({ error: "Category harus string non-kosong" }, { status: 400 });
    }

    // Validasi date (harus valid date string)
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Date harus format tanggal yang valid" }, { status: 400 });
    }

    // Validasi status (opsional, default "draft")
    if (status && !["draft", "published"].includes(status)) {
      return NextResponse.json({ error: "Status harus 'draft' atau 'published'" }, { status: 400 });
    }

    // Validasi images: Harus array string (ID GridFS), mirip Events
    if (!Array.isArray(images) || !images.every((id: string) => typeof id === "string" && id.length > 0)) {
      return NextResponse.json({ error: "images harus array ID GridFS yang valid" }, { status: 400 });
    }

    // Siapkan data untuk simpan (mirip Events)
    const galleryData: Partial<IGalleries> = {
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
      date: dateObj,
      category: category.trim(),
      status: status || "draft",
      images: images, // Array ID GridFS
    };

    const gallery = new Gallery(galleryData);
    const savedGallery = await gallery.save();

    return NextResponse.json(savedGallery, { status: 201 });
  } catch (error) {
    console.error("POST gallery error:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal membuat gallery";
    return NextResponse.json({ error: "Gagal membuat gallery", details: errorMessage }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Atur sesuai kebutuhan untuk upload gambar GridFS
    },
  },
};
