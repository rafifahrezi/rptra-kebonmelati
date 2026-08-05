import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Visits from "@/models/Visits";

// Interface for request body and response
interface VisitData {
  date: Date | string;
  balita?: string | number;
  anak?: string | number;
  remaja?: string | number;
  dewasa?: string | number;
  lansia?: string | number;
}

// 📌 GET all visits
export async function GET() {
  try {
    await dbConnect();
    const visits = await Visits.find().sort({ date: -1 }).lean();
    return NextResponse.json(visits);
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kunjungan", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 📌 CREATE new visit
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { date, balita = "0", anak = "0", remaja = "0", dewasa = "0", lansia = "0" } = body as VisitData;

    if (!date) {
      return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    const newVisit = await Visits.create({
      date: new Date(date),
      balita: Number(balita) || 0,
      anak: Number(anak) || 0,
      remaja: Number(remaja) || 0,
      dewasa: Number(dewasa) || 0,
      lansia: Number(lansia) || 0,
    });

    return NextResponse.json(newVisit, { status: 201 });
  } catch (error) {
    console.error("POST /api/analytics error:", error);
    return NextResponse.json(
      { error: "Gagal membuat data kunjungan", details: (error as Error).message },
      { status: 500 }
    );
  }
}