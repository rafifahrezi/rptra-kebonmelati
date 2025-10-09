import { NextRequest, NextResponse } from "next/server";
import ContactModel from "@/models/Contact";
import connectDB from "@/lib/mongoose";

// GET /api/contact - Fetch all contact messages
export async function GET() {
  try {
    await connectDB();
    const contacts = await ContactModel.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Gagal memuat pesan" }, 
      { status: 500 }
    );
  }
}

// POST /api/contact - Create new contact message
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, subject, category, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: "Nama, email, subjek, kategori, dan pesan wajib diisi" },
        { status: 400 }
      );
    }

    const contact = new ContactModel({
      name,
      email,
      phone: phone || undefined,
      subject,
      category,
      message,
    });

    const savedContact = await contact.save();
    return NextResponse.json(savedContact, { status: 201 });
  } catch (error: any) {
    console.error("Error creating contact message:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(", ");
      return NextResponse.json({ error: `Validasi gagal: ${messages}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}