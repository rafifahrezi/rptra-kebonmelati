import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import Operasional from "@/models/Operasional";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Fetch operational status using lean for performance
    let operasional = await Operasional.findById("current").lean();
    if (!operasional) {
      // Create default operational status if not found
      operasional = await Operasional.create({
        _id: "current",
        status: true,
        updatedAt: new Date(),
        updatedBy: "Sistem",
        updatedByEmail: "system@local",
      });
    }

    // Return operational status
    return NextResponse.json(operasional, { status: 200 });
  } catch (error) {
    console.error("GET /api/operasional error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Token tidak ditemukan" }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET as string);

    const { status, updatedBy, updatedByEmail } = await request.json();
    await connectDB();

    const operasional = await Operasional.findById("current");
    if (!operasional) {
      return NextResponse.json({ message: "Operasional status tidak ditemukan" }, { status: 404 });
    }

    operasional.status = status;
    operasional.updatedAt = new Date();
    operasional.updatedBy = updatedBy || "Sistem";
    operasional.updatedByEmail = updatedByEmail || "system@local";

    await operasional.save();

    // return langsung object
    return NextResponse.json(operasional);
  } catch (error) {
    console.error("POST operasional error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
