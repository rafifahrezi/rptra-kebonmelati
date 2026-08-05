// app/api/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import RequestModel from "@/models/Request";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const date = searchParams.get('date');

    // Query berdasarkan tahun dan bulan
    if (year && month) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      const requests = await RequestModel.find({
        tanggalPelaksanaan: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0]
        }
      });

      return NextResponse.json(requests);
    }

    // Query berdasarkan tanggal spesifik
    if (date) {
      const requests = await RequestModel.find({
        tanggalPelaksanaan: date
      });

      return NextResponse.json(requests);
    }

    // Jika tidak ada parameter, kembalikan semua permintaan
    const requests = await RequestModel.find({});
    return NextResponse.json(requests);
  } catch (error) {
    console.error("API request GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validasi sederhana
    const requiredFields = [
      "tanggalPelaksanaan",
      "namaPeminjam",
      "namaInstansi",
      "alamat",
      "noTelp",
      "jumlahPeserta",
      "waktuPenggunaan",
      "penggunaanRuangan",
      "tujuanPenggunaan",
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 });
      }
    }

    // Tambahkan status default jika tidak disediakan
    const newRequestData = {
      ...body,
      status: body.status || 'pending'
    };

    const newRequest = new RequestModel(newRequestData);
    await newRequest.save();

    return NextResponse.json({ 
      message: "Request saved successfully", 
      data: newRequest 
    }, { status: 201 });
  } catch (error) {
    console.error("API request POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Request updated successfully", 
      data: updatedRequest 
    });
  } catch (error) {
    console.error("API request PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const deletedRequest = await RequestModel.findByIdAndDelete(id);

    if (!deletedRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Request deleted successfully", 
      data: deletedRequest 
    });
  } catch (error) {
    console.error("API request DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
