import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Gallery, { IGalleries } from "@/models/Gallery";

export async function GET() {
  try {
    await dbConnect();
    const galleries = await Gallery.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(galleries, { status: 200 });
  } catch (error) {
    console.error("GET galleries error:", error);
    return NextResponse.json({ error: "Failed to fetch galleries", details: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { title, description, date, category, status, images } = body;

    // Strict validation based on schema
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    if (!category?.trim()) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (status && !["draft", "published"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'draft' or 'published'" }, { status: 400 });
    }

    const galleryData: Partial<IGalleries> = {
      title: title.trim(),
      description: description?.trim(),
      date: new Date(date),
      category: category.trim(),
      status: status || "draft",
      images: Array.isArray(images) ? images : [],
    };

    const gallery = new Gallery(galleryData);
    const savedGallery = await gallery.save();
    return NextResponse.json(savedGallery, { status: 201 });
  } catch (error) {
    console.error("POST gallery error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create gallery";
    return NextResponse.json({ error: "Failed to create gallery", details: errorMessage }, { status: 500 });
  }
}
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // atur sesuai kebutuhan (10mb, 50mb, 100mb, dll)
    },
  },
};
