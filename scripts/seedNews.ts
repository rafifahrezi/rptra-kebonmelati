import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "../lib/mongoose";
import News from "../models/News";

const SEED_DATA = [
  {
    title: "Pembukaan Program Terapi Wicara Gratis untuk Anak",
    subtitle: "RPTRA Kebon Melati hadirkan layanan baru bagi warga sekitar",
    content:
      "RPTRA Kebon Melati resmi membuka program terapi wicara gratis bagi anak-anak usia dini yang mengalami keterlambatan bicara. Program ini merupakan hasil kerja sama dengan tenaga profesional dan bertujuan mendukung tumbuh kembang anak secara optimal. Pendaftaran dapat dilakukan langsung di kantor pengelola RPTRA setiap hari kerja.",
    category: "Kesehatan",
    author: "Admin RPTRA",
    featured: true,
    published: true,
    tags: ["terapi wicara", "anak", "kesehatan", "gratis"],
    image: "",
  },
  {
    title: "Penyuluhan E-Perpustakaan RPTRA Resmi Diluncurkan",
    subtitle:
      "Warga kini dapat mengakses koleksi buku digital secara online melalui Google Drive",
    content:
      "RPTRA Kebon Melati mengadakan kegiatan penyuluhan mengenai layanan E-Perpustakaan sebagai upaya meningkatkan minat baca dan kemudahan akses informasi bagi masyarakat. Dalam kegiatan ini, warga diperkenalkan cara mengakses koleksi buku digital melalui tautan Google Drive yang telah disediakan. Layanan ini dapat digunakan kapan saja dan di mana saja menggunakan smartphone maupun komputer. Melalui inovasi ini, diharapkan masyarakat, khususnya anak-anak dan remaja, semakin mudah memperoleh bahan bacaan edukatif tanpa harus datang langsung ke perpustakaan.",
    category: "Pendidikan",
    author: "Pengelola RPTRA Kebon Melati",
    featured: true,
    published: true,
    tags: [
      "e-perpustakaan",
      "literasi digital",
      "google drive",
      "penyuluhan",
      "perpustakaan digital",
    ],
    image: "",
  },
  {
    title: "Lomba Mewarnai dan Menggambar Tingkat RPTRA",
    subtitle: "Ajang kreativitas anak-anak di lingkungan RPTRA Kebon Melati",
    content:
      "Dalam rangka memperingati hari anak, RPTRA Kebon Melati mengadakan lomba mewarnai dan menggambar yang diikuti puluhan peserta dari berbagai kelompok usia. Kegiatan ini bertujuan untuk mengasah kreativitas anak sekaligus mempererat interaksi sosial antarwarga.",
    category: "Program Anak",
    author: "Panitia Kegiatan",
    featured: true,
    published: true,
    tags: ["lomba", "anak", "kreativitas"],
    image: "",
  },
];

async function seedNews() {
  try {
    console.log("🔌 Menghubungkan ke database...");
    await connectDB();
    console.log("✅ Terhubung ke database");

    console.log("🗑️  Menghapus data news lama...");
    await News.deleteMany({});
    console.log("✅ Data lama berhasil dihapus");

    console.log("🌱 Menambahkan data seed news...");
    const now = new Date();

    const dataWithTimestamps = SEED_DATA.map((item, index) => ({
      ...item,
      createdAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000), // stagger tanggal
      updatedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000),
    }));

    const inserted = await News.insertMany(dataWithTimestamps);
    console.log(`✅ Berhasil menambahkan ${inserted.length} berita`);

    inserted.forEach((news, i) => {
      console.log(`   ${i + 1}. ${news.title}`);
    });

    console.log("🎉 Seeding data news selesai!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal melakukan seeding data news:", error);
    process.exit(1);
  }
}

seedNews();
