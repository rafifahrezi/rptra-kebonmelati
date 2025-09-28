// app/api/gallery/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dbConnect from "@/lib/mongoose";
import Gallery from "@/models/Gallery";

interface GalleryRequestBody {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  status?: "draft" | "published";
  images?: string[]; // Array ID GridFS
}

/**
 * Safely resolve the (possibly thenable) context and return params object.
 * This prevents the Next warning about reading params synchronously.
 * (Sinkron dengan Events)
 */
async function resolveParams(context: any): Promise<Record<string, any> | undefined> {
  const resolved = await Promise.resolve(context);
  if (!resolved || typeof resolved !== "object") return undefined;
  return resolved.params ?? undefined;
}

/* ------------------------------
   GET /api/gallery/:id
   Ambil detail gallery by ID (sinkron dengan Events)
   ------------------------------ */
export async function GET(request: Request, context: any) {
  try {
    const params = await resolveParams(context);
    const id = params?.id;
    console.log('[GET /api/gallery/:id] resolved params:', { id });

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();

    const gallery = await Gallery.findById(id).lean();
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json(gallery, { status: 200 });
  } catch (err) {
    console.error("GET /api/gallery/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

/* ------------------------------
   PUT /api/gallery/:id
   Update gallery by ID (sinkron dengan Events)
   ------------------------------ */
export async function PUT(request: Request, context: any) {
  try {
    const params = await resolveParams(context);
    const id = params?.id;
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const data: GalleryRequestBody = await request.json();

    // Trim strings jika ada
    if (typeof data.title === "string") data.title = data.title.trim();
    if (typeof data.description === "string") data.description = data.description.trim();
    if (typeof data.category === "string") data.category = data.category.trim();

    // Validasi images jika disediakan (array ID GridFS)
    if (data.images !== undefined && (!Array.isArray(data.images) || !data.images.every((imgId: string) => typeof imgId === "string" && imgId.length > 0))) {
      return NextResponse.json({ error: "images harus array ID GridFS yang valid" }, { status: 400 });
    }

    // Validasi status jika disediakan
    if (data.status && !["draft", "published"].includes(data.status)) {
      return NextResponse.json({ error: "Status harus 'draft' atau 'published'" }, { status: 400 });
    }

    // Validasi date jika disediakan
    if (data.date) {
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ error: "Date harus format tanggal yang valid" }, { status: 400 });
      }
      data.date = dateObj; // Convert ke Date object
    }

    await dbConnect();

    const updated = await Gallery.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: new Date() } }, // Sinkron dengan Events: $set dan updatedAt
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/gallery/:id error:", err);
    return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 });
  }
}

/* ------------------------------
   DELETE /api/gallery/:id
   Hapus gallery by ID (sinkron dengan Events)
   ------------------------------ */
export async function DELETE(request: Request, context: any) {
  try {
    const params = await resolveParams(context);
    const id = params?.id;
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();

    const deleted = await Gallery.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Gallery deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/gallery/:id error:", err);
    return NextResponse.json({ error: "Failed to delete gallery" }, { status: 500 });
  }
}
