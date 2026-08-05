export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { GridFSService } from "@/lib/gridfs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Konversi file ke Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const contentType = file.type;

    // Upload ke GridFS
    const fileId = await GridFSService.uploadFile(buffer, filename, contentType);

    return NextResponse.json({ success: true, fileId, message: "File berhasil diupload" }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
  }
}
