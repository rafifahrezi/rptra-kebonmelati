export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Readable } from "stream";
import { GridFSService } from "@/lib/gridfs";
import { ObjectId } from "mongodb";
import sharp from "sharp";

type ContextParam = { params?: { id?: string } } | any;

// Fungsi untuk mengoptimasi gambar
async function optimizeImage(
  buffer: Buffer, 
  options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'avif' | 'png';
    quality?: number;
  } = {}
) {
  const {
    width = 800,
    height,
    format = 'webp',
    quality = 80
  } = options;

  try {
    return await sharp(buffer)
      .resize({ 
        width, 
        height, 
        fit: 'cover',
        position: 'center'
      })
      .toFormat(format, { quality })
      .toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Image optimization failed');
  }
}

// Fungsi untuk menghasilkan placeholder
async function generatePlaceholder(buffer: Buffer) {
  return await sharp(buffer)
    .resize({ width: 10, height: 10, fit: 'cover' })
    .toBuffer();
}

// Fungsi pembantu untuk resolusi konteks
async function resolveContext(context: ContextParam) {
  return await Promise.resolve(context);
}

// Fungsi untuk ekstraksi ID
async function getIdFromContext(context: ContextParam): Promise<string | undefined> {
  const resolved = await resolveContext(context);
  const raw = resolved?.params?.id;
  if (!raw) return undefined;
  
  try {
    const decoded = typeof raw === "string" ? decodeURIComponent(raw) : raw;
    return typeof decoded === "string" ? decoded : undefined;
  } catch {
    return typeof raw === "string" ? raw : undefined;
  }
}

export async function GET(request: Request, context: ContextParam) {
  try {
    const fileId = await getIdFromContext(context);
    const searchParams = new URL(request.url).searchParams;
    const optimize = searchParams.get('optimize') === 'true';
    const width = parseInt(searchParams.get('width') || '800', 10);
    const height = parseInt(searchParams.get('height') || '0', 10);
    const format = searchParams.get('format') as 'webp' | 'avif' | 'png' | undefined;

    // Validasi ID
    if (!fileId || fileId === "undefined") {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID format" }, { status: 400 });
    }

    // Ambil file
    const fileData = await GridFSService.getFile(fileId);
    if (!fileData) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { stream: nodeStream, file } = fileData;
    if (!nodeStream) {
      return NextResponse.json({ error: "File stream unavailable" }, { status: 404 });
    }

    // Konversi stream Node.js ke buffer
    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Optimasi gambar jika diminta
    let processedBuffer = buffer;
    if (optimize) {
      try {
        processedBuffer = await optimizeImage(buffer, {
          width: width || undefined,
          height: height || undefined,
          format,
        });
      } catch (optimizationError) {
        console.error('Image optimization failed:', optimizationError);
        // Fallback ke buffer asli jika optimasi gagal
      }
    }

    // Siapkan header
    const headers = new Headers();
    headers.set("Content-Type", optimize ? `image/${format || 'webp'}` : (file.contentType as string) || "application/octet-stream");
    headers.set("Content-Length", String(processedBuffer.length));
    
    const safeFilename = (file.filename || file._id || "file").toString().replace(/["\\]/g, "");
    headers.set("Content-Disposition", `inline; filename="${safeFilename}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Konversi buffer ke ReadableStream Web
    const webStream = new ReadableStream({
      start(controller) {
        controller.enqueue(processedBuffer);
        controller.close();
      }
    });

    return new Response(webStream, { 
      status: 200, 
      headers 
    });

  } catch (err) {
    console.error("GET /api/files/:id streaming error:", err);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}

// Tambahan: Route untuk placeholder
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const placeholderBuffer = await generatePlaceholder(Buffer.from(buffer));

    return NextResponse.json({
      placeholder: `data:image/png;base64,${placeholderBuffer.toString('base64')}`
    });

  } catch (err) {
    console.error("Placeholder generation error:", err);
    return NextResponse.json({ error: "Failed to generate placeholder" }, { status: 500 });
  }
}
