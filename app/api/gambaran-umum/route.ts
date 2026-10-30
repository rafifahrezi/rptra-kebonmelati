import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import GambaranUmum from "@/models/GambaranUmum";
import { isAdmin, unauthorized, fail } from "@/lib/apiHelpers";

// Terbaru di index 0: publik pakai items[0], admin pakai seluruh list
export async function GET() {
  try {
    await connectDB();
    const items = await GambaranUmum.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  try {
    await connectDB();
    const { deskripsi, gambar } = await request.json();
    const item = await GambaranUmum.create({ deskripsi, gambar });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
