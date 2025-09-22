import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";

// 🔹 GET by ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const event = await Event.findById(params.id).lean();
    if (!event) {
      return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("GET /events/:id error:", error);
    return NextResponse.json({ error: "Gagal mengambil event" }, { status: 500 });
  }
}

// 🔹 UPDATE (PUT)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const data = await request.json();

    // Optional sanitization
    if (data.title) data.title = data.title.trim();
    if (data.category) data.category = data.category.trim();
    if (data.location) data.location = data.location.trim();

    const updatedEvent = await Event.findByIdAndUpdate(
      params.id,
      { $set: { ...data, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("PUT /events/:id error:", error);
    return NextResponse.json({ error: "Gagal update event" }, { status: 500 });
  }
}

// 🔹 DELETE
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const deletedEvent = await Event.findByIdAndDelete(params.id).lean();
    if (!deletedEvent) {
      return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ message: "✅ Event berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /events/:id error:", error);
    return NextResponse.json({ error: "Gagal menghapus event" }, { status: 500 });
  }
}
