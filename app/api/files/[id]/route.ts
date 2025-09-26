export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GridFSService } from "@/lib/gridfs";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const fileId = params.id;
    if (!fileId) return NextResponse.json({ error: "File ID required" }, { status: 400 });

    const fileData = await GridFSService.getFile(fileId);
    if (!fileData) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const { stream, file } = fileData;

    // Return streaming response (Node runtime supports readable stream body)
    const headers = new Headers();
    headers.set("Content-Type", file.contentType || "application/octet-stream");
    headers.set("Content-Length", String(file.length || 0));
    headers.set("Content-Disposition", `inline; filename="${file.filename}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Node ReadableStream can be returned directly in NextResponse in Node runtime
    // return new NextResponse(stream as unknown as NodeJS.ReadableStream, { status: 200, headers });
  } catch (err) {
    console.error("Serve file error:", err);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Add auth check here if required (cookie JWT)
    const fileId = params.id;
    if (!fileId) return NextResponse.json({ error: "File ID required" }, { status: 400 });

    const success = await GridFSService.deleteFile(fileId);
    if (!success) return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });

    return NextResponse.json({ success: true, message: "File deleted" }, { status: 200 });
  } catch (err) {
    console.error("Delete file error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
