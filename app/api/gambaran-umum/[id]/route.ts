import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import connectDB from "@/lib/mongoose";
import GambaranUmum from "@/models/GambaranUmum";
import { isAdmin, unauthorized, fail } from "@/lib/apiHelpers";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json(
    { success: false, message: "Data tidak ditemukan" },
    { status: 404 },
  );

async function deleteImage(id: string) {
  if (!id) return;
  try {
    await new GridFSBucket(mongoose.connection.db!).delete(
      new mongoose.Types.ObjectId(id),
    );
  } catch (err) {
    console.error(`Gagal menghapus file GridFS ${id}:`, err);
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return notFound();
    await connectDB();

    const item = await GambaranUmum.findById(id);
    if (!item) return notFound();

    const { deskripsi, gambar } = await request.json();
    const oldImage: string = item.gambar;
    item.set({ deskripsi, gambar }); // hanya 2 field ini, bukan spread body
    await item.save(); // validator schema jalan di sini

    if (oldImage && oldImage !== item.gambar) await deleteImage(oldImage);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return notFound();
    await connectDB();

    const item = await GambaranUmum.findByIdAndDelete(id);
    if (!item) return notFound();

    await deleteImage(item.gambar);
    return NextResponse.json({ success: true });
  } catch (error) {
    return fail(error);
  }
}
