import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import connectDB from "@/lib/mongoose";
import Pegawai from "@/models/Pegawai";
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

    const item = await Pegawai.findById(id);
    if (!item) return notFound();

    const { nama, jabatan, foto, urutan } = await request.json();
    const oldFoto: string = item.foto;
    // Hanya field yang dikirim yang diubah: foto yang tidak dikirim tidak ikut terhapus
    item.set(
      Object.fromEntries(
        Object.entries({ nama, jabatan, foto, urutan }).filter(
          ([, v]) => v !== undefined,
        ),
      ),
    );
    await item.save(); // validator schema jalan di sini

    if (oldFoto && oldFoto !== item.foto) await deleteImage(oldFoto);
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

    const item = await Pegawai.findByIdAndDelete(id);
    if (!item) return notFound();

    await deleteImage(item.foto);
    return NextResponse.json({ success: true });
  } catch (error) {
    return fail(error);
  }
}
