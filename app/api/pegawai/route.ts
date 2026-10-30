import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Pegawai from "@/models/Pegawai";
import { isAdmin, unauthorized, fail } from "@/lib/apiHelpers";

// Publik dan admin sama-sama memakai urutan ini; createdAt jadi pemisah saat urutan sama
export async function GET() {
  try {
    await connectDB();
    const items = await Pegawai.find().sort({ urutan: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  try {
    await connectDB();
    const { nama, jabatan, foto, urutan } = await request.json();
    const item = await Pegawai.create({ nama, jabatan, foto, urutan });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
