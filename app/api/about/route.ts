import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import About from "@/models/About";
import { GridFSBucket } from "mongodb";

const defaultAboutData = {
  _id: "main",
  title: "About RPTRA Kebon Melati",
  subtitle: "Ruang Publik Terpadu Ramah Anak yang berkomitmen menciptakan lingkungan aman dan mendukung perkembangan anak di Jakarta Pusat",
  mission: { title: "Misi Kami", description: "Menyediakan ruang aman ...", image: "" },
  vision: { title: "Visi", description: "Menjadi ruang publik terdepan ...", image: "" },
  values: { title: "Nilai-Nilai", description: "Keamanan, Pendidikan, ..." },
  programs: {
    title: "Program Kami",
    description: "Beragam program yang mendukung perkembangan anak ...",
    items: [
      { name: "Program Pendidikan Anak", description: "Kegiatan belajar ..." },
      { name: "Program Kesehatan Masyarakat", description: "Edukasi kesehatan ..." },
    ],
  },
  facilities: {
    title: "Fasilitas",
    description: "Fasilitas lengkap ...",
    items: [
      { name: "Ruang Bermain Anak", description: "Area bermain ..." },
      { name: "Perpustakaan Mini", description: "Koleksi buku ..." },
    ],
    images: [],
  },
  collaborations: {
    title: "Kemitraan",
    description: "Bekerjasama dengan berbagai pihak ...",
    partners: [
      { name: "Dinas Sosial DKI Jakarta", role: "Pembina dan Pengawas" },
      { name: "Puskesmas Setempat", role: "Partner Kesehatan" },
    ],
  },
  operational: {
    title: "Jam Operasional",
    hours: {
      senin: "06:00 - 13:00",
      selasa: "06:00 - 12:00",
      rabu: "06:00 - 12:00",
      kamis: "06:00 - 12:00",
      jumat: "06:00 - 13:00",
      sabtu: "08:00 - 14:00",
      minggu: "08:00 - 14:00",
    },
  },
  establishedYear: "2017",
  establishedText: "Berdiri Sejak",
  lastUpdated: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    let about = await About.findById("main").lean();

    if (!about) {
      about = await About.create(defaultAboutData);
    }

    return NextResponse.json(
      { success: true, about },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("GET about error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();

    // Validasi field wajib
    const requiredFields = [
      'title', 'subtitle', 'mission', 'vision', 'values', 
      'programs', 'facilities', 'collaborations', 
      'operational', 'establishedYear', 'establishedText'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ 
          error: `${field} wajib diisi` 
        }, { status: 400 });
      }
    }

    // Validasi images fasilitas
    if (data.facilities && data.facilities.images) {
      // Validasi images: Harus array string (ID GridFS)
      if (!Array.isArray(data.facilities.images) || 
          !data.facilities.images.every((id: string) => 
            typeof id === "string" && id.length === 24
          )) {
        return NextResponse.json({ 
          error: "Facility images harus array ID GridFS yang valid" 
        }, { status: 400 });
      }

      // Batasi jumlah gambar
      if (data.facilities.images.length > 4) {
        return NextResponse.json({ 
          error: "Maksimal 4 gambar fasilitas" 
        }, { status: 400 });
      }
    }

    // Validasi image mission dan vision (jika ada)
    const validateSingleImage = (image: string) => {
      return image === '' || (typeof image === 'string' && image.length === 24);
    };

    if (data.mission?.image && !validateSingleImage(data.mission.image)) {
      return NextResponse.json({ 
        error: "Mission image harus ID GridFS yang valid" 
      }, { status: 400 });
    }

    if (data.vision?.image && !validateSingleImage(data.vision.image)) {
      return NextResponse.json({ 
        error: "Vision image harus ID GridFS yang valid" 
      }, { status: 400 });
    }

    // Temukan dokumen saat ini untuk membandingkan gambar
    const currentAbout = await About.findById("main");
    
    // Proses penghapusan gambar yang tidak digunakan
    const processImageDeletion = async (
      currentImages: mongoose.Types.ObjectId[], 
      newImages: string[]
    ) => {
      const newImageIds = newImages.map(id => new mongoose.Types.ObjectId(id));
      
      const imagesToDelete = currentImages.filter(
        (id) => !newImageIds.some((newId) => newId.equals(id))
      );

      if (imagesToDelete.length > 0) {
        const bucket = new GridFSBucket(mongoose.connection.db);
        for (const id of imagesToDelete) {
          try {
            await bucket.delete(id);
          } catch (err) {
            console.error(`Gagal menghapus file GridFS ${id}:`, err);
          }
        }
      }
    };

    // Hapus gambar fasilitas yang tidak digunakan
    if (currentAbout?.facilities?.images) {
      await processImageDeletion(
        currentAbout.facilities.images, 
        data.facilities.images || []
      );
    }

    // Hapus gambar mission yang tidak digunakan
    if (currentAbout?.mission?.image) {
      const currentMissionImage = currentAbout.mission.image;
      const newMissionImage = data.mission?.image || '';
      
      if (currentMissionImage && currentMissionImage !== newMissionImage) {
        try {
          const bucket = new GridFSBucket(mongoose.connection.db);
          await bucket.delete(new mongoose.Types.ObjectId(currentMissionImage));
        } catch (err) {
          console.error(`Gagal menghapus mission image ${currentMissionImage}:`, err);
        }
      }
    }

    // Perbarui atau buat dokumen
    const about = await About.findByIdAndUpdate(
      "main",
      {
        ...data,
        facilities: {
          ...data.facilities,
          images: data.facilities.images 
            ? data.facilities.images.map((id: string) => new mongoose.Types.ObjectId(id)) 
            : [],
        },
        mission: {
          ...data.mission,
          image: data.mission?.image || '',
        },
        vision: {
          ...data.vision,
          image: data.vision?.image || '',
        },
        lastUpdated: new Date().toISOString(),
      },
      { 
        upsert: true, 
        new: true, 
        runValidators: true 
      }
    );

    return NextResponse.json(about, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating about:", error);
    return NextResponse.json({ 
      error: "Gagal membuat/memperbarui about" 
    }, { status: 500 });
  }
}
