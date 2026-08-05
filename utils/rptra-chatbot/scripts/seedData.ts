// scripts/seedData.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import connectDB from '@/lib/mongoose';
import Event from '../models/Event';

const SEED_DATA = [
  {
    title: 'Senam Pagi Anak-Anak',
    description: 'Kegiatan senam pagi yang menyenangkan untuk anak-anak usia 3-8 tahun. Dipandu oleh instruktur profesional dengan musik yang ceria.',
    category: 'Olahraga',
    date: '2026-12-15',
    time: '07:00 - 08:00',
    location: 'Lapangan Utama RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Workshop Melukis Gratis',
    description: 'Belajar melukis dengan berbagai teknik seni. Semua bahan disediakan oleh RPTRA. Cocok untuk anak usia 5-12 tahun.',
    category: 'Seni & Kreativitas',
    date: '2026-12-16',
    time: '10:00 - 12:00',
    location: 'Ruang Seni RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Permainan Bola Basket Mini',
    description: 'Pertandingan bola basket mini untuk anak-anak. Tim-tim akan dibentuk oleh instruktur. Ada hadiah menarik untuk pemenang.',
    category: 'Olahraga',
    date: '2026-12-17',
    time: '15:00 - 17:00',
    location: 'Lapangan Basket RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Cerita Interaktif & Dongeng',
    description: 'Sesi cerita interaktif dengan storyteller profesional. Anak-anak akan diajak berkontribusi dalam menceritakan kisah mereka.',
    category: 'Edukasi',
    date: '2026-12-18',
    time: '14:00 - 15:30',
    location: 'Ruang Perpustakaan RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Lomba Balap Sepeda Roda Tiga',
    description: 'Lomba seru balap sepeda roda tiga untuk anak usia 3-6 tahun. Kategori umur akan dibagi. Pemenang mendapat medali & hadiah.',
    category: 'Olahraga',
    date: '2026-12-19',
    time: '08:00 - 10:00',
    location: 'Lapangan Utama RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Kelas Tari Tradisional',
    description: 'Belajar tari tradisional Indonesia yang indah. Instruktur berpengalaman akan mengajarkan gerakan dasar hingga kombinasi yang lebih rumit.',
    category: 'Seni & Kreativitas',
    date: '2026-12-20',
    time: '16:00 - 17:30',
    location: 'Ruang Seni RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Camping Malam Keluarga',
    description: 'Pengalaman camping seru bersama keluarga di area RPTRA. Kami sediakan tenda, bonfire, dan permainan malam yang seru.',
    category: 'Outdoor',
    date: '2026-12-21',
    time: '17:00 - 22:00',
    location: 'Area Outdoor RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Cerdas Cermat Pengetahuan Umum',
    description: 'Kompetisi kuis untuk menguji pengetahuan umum anak-anak. Materi dari berbagai topik menarik. Hadiah untuk 3 besar.',
    category: 'Edukasi',
    date: '2026-12-22',
    time: '13:00 - 15:00',
    location: 'Aula Utama RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Pelatihan Renang Anak Pemula',
    description: 'Kursus renang dasar untuk anak yang belum bisa berenang. Instruktur profesional siap membantu dengan teknik yang aman dan menyenangkan.',
    category: 'Olahraga',
    date: '2026-11-23',
    time: '09:00 - 11:00',
    location: 'Kolam Renang RPTRA',
    status: 'upcoming',
    images: [
    ]
  },
  {
    title: 'Pelatihan Sepak Bola Anak',
    description: 'Latihan teknik dasar sepak bola dipandu pelatih bersertifikat. Cocok untuk pemula maupun yang sudah berpengalaman.',
    category: 'Olahraga',
    date: '2026-06-10',
    time: '16:00 - 17:30',
    location: 'Lapangan Bola RPTRA',
    status: 'ongoing',
    images: [
    ]
  },
  {
    title: 'Pameran Lukisan Anak-Anak Terdahulu',
    description: 'Pameran karya seni anak-anak dari bulan-bulan sebelumnya. Menampilkan berbagai teknik dan kreativitas anak-anak RPTRA.',
    category: 'Seni & Kreativitas',
    date: '2026-05-05',
    time: '10:00 - 16:00',
    location: 'Galeri RPTRA',
    status: 'finished',
    images: [
    ]
  },
  {
    title: 'Festival Permainan Tradisional',
    description: 'Festival seru menampilkan berbagai permainan tradisional Indonesia. Setiap anak bisa mencoba semua permainan dengan gratis.',
    category: 'Outdoor',
    date: '2026-05-21',
    time: '08:00 - 16:00',
    location: 'Seluruh Area RPTRA',
    status: 'finished',
    images: [
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('📦 Menghubungkan ke database...');
    await connectDB();
    console.log('✅ Terhubung ke database');

    // Clear existing data
    console.log('🗑️  Menghapus data Event yang ada...');
    const deleteResult = await Event.deleteMany({});
    console.log(`✅ Dihapus ${deleteResult.deletedCount} event`);

    // Insert seed data
    console.log('📝 Menambahkan sample data...');
    const insertedEvents = await Event.insertMany(SEED_DATA);
    console.log(`✅ Berhasil menambahkan ${insertedEvents.length} events`);

    // Display summary
    console.log('\n📊 Ringkasan Data:');
    console.log('=====================================');
    
    const statusCount = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    statusCount.forEach((item) => {
      console.log(`  ${item._id}: ${item.count} events`);
    });

    const categoryCount = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📚 Berdasarkan Kategori:');
    console.log('=====================================');
    categoryCount.forEach((item) => {
      console.log(`  ${item._id}: ${item.count} events`);
    });

    console.log('\n✨ Seed Data berhasil ditambahkan!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Koneksi database ditutup');
    process.exit(0);
  }
}

seedDatabase();