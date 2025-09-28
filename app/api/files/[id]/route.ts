// app/api/files/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Readable } from "stream";
import { GridFSService } from "@/lib/gridfs";
import { ObjectId } from "mongodb";

type ContextParam = { params?: { id?: string } } | any;

/**
 * Safely resolve possibly-thenable context.
 * Uses Promise.resolve to support thenable or plain object.
 */
async function resolveContext(context: ContextParam) {
  return await Promise.resolve(context);
}

/**
 * Extract id safely (returns undefined if not string)
 */
async function getIdFromContext(context: ContextParam): Promise<string | undefined> {
  const resolved = await resolveContext(context);
  const raw = resolved?.params?.id;
  if (!raw) return undefined;
  // decode URI component (client may send encoded id)
  try {
    const decoded = typeof raw === "string" ? decodeURIComponent(raw) : raw;
    return typeof decoded === "string" ? decoded : undefined;
  } catch {
    // if decode fails, fall back to raw
    return typeof raw === "string" ? raw : undefined;
  }
}

export async function GET(request: Request, context: ContextParam) {
  try {
    const fileId = await getIdFromContext(context);

    // Basic validation & defensive checks
    if (!fileId || fileId === "undefined") {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    // If you're using MongoDB ObjectId for GridFS, validate it here.
    // If you use custom IDs, remove/adjust this check.
    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID format" }, { status: 400 });
    }

    // Fetch file metadata + node stream
    const fileData = await GridFSService.getFile(fileId);
    if (!fileData) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { stream: nodeStream, file } = fileData;
    if (!nodeStream) {
      return NextResponse.json({ error: "File stream unavailable" }, { status: 404 });
    }

    // ETag handling (cache validation)
    const serverETag = file._id ? String(file._id) : undefined;
    const clientETag = request.headers.get("if-none-match");
    if (serverETag && clientETag && clientETag === serverETag) {
      return new Response(null, { status: 304 });
    }

    // Abort handling — ensure we destroy stream on client disconnect
    const onAbort = () => {
      try {
        if (typeof (nodeStream as any).destroy === "function") {
          (nodeStream as any).destroy(new Error("Client aborted"));
        } else if (typeof (nodeStream as any).close === "function") {
          (nodeStream as any).close();
        }
      } catch {
        /* ignore */
      }
    };

    if (request.signal?.aborted) {
      onAbort();
      return new Response(null, { status: 499 }); // client closed
    }
    request.signal?.addEventListener?.("abort", onAbort);

    // Convert Node.js Readable to Web ReadableStream (Node >=17)
    const webStream = Readable.toWeb(nodeStream as unknown as Readable);

    // Prepare headers
    const headers = new Headers();
    headers.set("Content-Type", (file.contentType as string) || "application/octet-stream");
    if (typeof file.length === "number") headers.set("Content-Length", String(file.length));
    // Prefer inline for images — change to attachment for forced download
    const safeFilename = (file.filename || file._id || "file").toString().replace(/["\\]/g, "");
    headers.set("Content-Disposition", `inline; filename="${safeFilename}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    if (serverETag) headers.set("ETag", serverETag);

    // Best-effort cleanup: remove abort listener when stream ends/errors
    try {
      nodeStream.on?.("close", () => request.signal?.removeEventListener?.("abort", onAbort));
      nodeStream.on?.("end", () => request.signal?.removeEventListener?.("abort", onAbort));
      nodeStream.on?.("error", () => request.signal?.removeEventListener?.("abort", onAbort));
    } catch {
      /* ignore */
    }

    return new Response(webStream, { status: 200, headers });
  } catch (err) {
    console.error("GET /api/files/:id streaming error:", err);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
