export const runtime = "nodejs"
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";

export async function GET() {
  await dbConnect();
  try {
    const events = await Event.find().sort({ date: -1 }).lean();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Gagal mengambil data event" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Validasi field wajib (images sekarang array ID GridFS)
    const requiredFields = ["title", "category", "date", "location", "status", "images"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} wajib diisi` }, { status: 400 });
      }
    }

    // Validasi images: Harus array string (ID GridFS)
    if (!Array.isArray(data.images) || !data.images.every((id: string) => typeof id === "string" && id.length > 0)) {
      return NextResponse.json({ error: "images harus array ID GridFS yang valid" }, { status: 400 });
    }

    // Simpan event dengan images sebagai array ID
    const event = new Event(data);
    await event.save();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Gagal membuat event" }, { status: 500 });
  }
}
