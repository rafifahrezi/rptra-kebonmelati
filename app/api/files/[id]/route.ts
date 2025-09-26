export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dbConnect from "@/lib/mongoose";
import { GridFSService } from "@/lib/gridfs";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const fileId = params.id;
    if (!fileId || !ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "File ID tidak valid" }, { status: 400 });
    }

    const fileData = await GridFSService.getFile(fileId);
    if (!fileData) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    const { stream, file } = fileData;

    const headers = new Headers();
    headers.set("Content-Type", file.contentType || "application/octet-stream");
    headers.set("Content-Length", String(file.length || 0));
    headers.set("Content-Disposition", `inline; filename="${file.filename}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(stream, { status: 200, headers });
  } catch (err) {
    console.error("Serve file error:", err);
    return NextResponse.json({ error: "Gagal mengambil file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const fileId = params.id;
    if (!fileId || !ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "File ID tidak valid" }, { status: 400 });
    }

    const success = await GridFSService.deleteFile(fileId);
    if (!success) {
      return NextResponse.json({ error: "Gagal menghapus file" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "File berhasil dihapus" }, { status: 200 });
  } catch (err) {
    console.error("Delete file error:", err);
    return NextResponse.json({ error: "Gagal menghapus file" }, { status: 500 });
  }
}
