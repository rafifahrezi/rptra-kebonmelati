import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validasi size (max 2MB)
    if (file.size > 40 * 1024 * 1024) {
      return NextResponse.json({ error: "File terlalu besar (max 2MB)" }, { status: 400 });
    }

    // Validasi type image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
    }

    // Generate nama unik
    const ext = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${ext}`;

    // Folder upload
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true }); // buat folder jika belum ada

    // Convert ke buffer & simpan
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(path.join(uploadDir, fileName), buffer);

    // Return URL agar bisa langsung digunakan di frontend
    const fileUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
};
