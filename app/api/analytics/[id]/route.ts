import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Visits from "@/models/Visits";

// Interface for request body
interface VisitUpdate {
  date?: Date | string;
  balita?: string | number;
  anak?: string | number;
  remaja?: string | number;
  dewasa?: string | number;
  lansia?: string | number;
}

// 📌 GET visit by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    if (!params.id || typeof params.id !== "string") {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }
    const visit = await Visits.findById(params.id).lean();
    if (!visit) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(visit);
  } catch (error) {
    console.error("GET /api/analytics/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 📌 DELETE visit by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    if (!params.id || typeof params.id !== "string") {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }
    const deleted = await Visits.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ message: "✅ Data berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/analytics/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 📌 UPDATE visit by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    if (!params.id || typeof params.id !== "string") {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { date, balita = "0", anak = "0", remaja = "0", dewasa = "0", lansia = "0" } = body as VisitUpdate;

    if (!date) {
      return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    const updateData = {
      date: new Date(date),
      balita: Number(balita) || 0,
      anak: Number(anak) || 0,
      remaja: Number(remaja) || 0,
      dewasa: Number(dewasa) || 0,
      lansia: Number(lansia) || 0,
    };

    if (isNaN(updateData.date.getTime())) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
    }

    const updated = await Visits.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/analytics/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data", details: (error as Error).message },
      { status: 500 }
    );
  }
}