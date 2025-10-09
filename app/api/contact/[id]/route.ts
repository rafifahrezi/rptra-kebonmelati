import { NextRequest, NextResponse } from "next/server";
import ContactModel from "@/models/Contact";
import connectDB from "@/lib/mongoose";

interface Params {
  params: {
    id: string;
  };
}

// DELETE /api/contact/[id] - Delete contact message
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const contact = await ContactModel.findByIdAndDelete(params.id);
    
    if (!contact) {
      return NextResponse.json(
        { error: "Pesan tidak ditemukan" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Pesan berhasil dihapus",
      deletedId: params.id 
    });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pesan" }, 
      { status: 500 }
    );
  }
}