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

import mongoose from "mongoose";
import { syncToKnowledgeBase } from "@/services/api/syncService";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Validasi field wajib (images sekarang array ID GridFS)
    const requiredFields = ["title", "category", "date", "time", "location", "status", "images"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} wajib diisi` }, { status: 400 });
      }
    }

    // Validasi images: Harus array string (ID GridFS)
    if (!Array.isArray(data.images) || !data.images.every((id: string) => typeof id === "string" && id.length > 0)) {
      return NextResponse.json({ error: "images harus array ID GridFS yang valid" }, { status: 400 });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Simpan event dengan images sebagai array ID
      const event = new Event(data);
      await event.save({ session });

      const content = `Kegiatan ${event.title} berlokasi di ${event.location} pada ${event.date} ${event.time}. Deskripsi: ${event.description || ''}`;

      await syncToKnowledgeBase(
        event._id.toString(),
        'Event',
        event.title,
        content,
        session
      );

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(event, { status: 201 });
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Gagal membuat event" }, { status: 500 });
  }
}
