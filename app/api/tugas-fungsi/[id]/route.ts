import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import TugasFungsi from "@/models/TugasFungsi";
import { isAdmin, unauthorized, fail } from "@/lib/apiHelpers";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json(
    { success: false, message: "Data tidak ditemukan" },
    { status: 404 },
  );

export async function PUT(request: NextRequest, { params }: Ctx) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return notFound();
    await connectDB();

    const item = await TugasFungsi.findById(id);
    if (!item) return notFound();

    const { descTugas, descFungsi } = await request.json();
    item.set({ descTugas, descFungsi }); // hanya 2 field ini, bukan spread body
    await item.save(); // validator schema jalan di sini

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

    const item = await TugasFungsi.findByIdAndDelete(id);
    if (!item) return notFound();

    return NextResponse.json({ success: true });
  } catch (error) {
    return fail(error);
  }
}
