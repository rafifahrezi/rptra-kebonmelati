import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import connectDB from '../lib/mongoose';
import About from '../models/About';

// Default data for About collection
const aboutData = {
  _id: 'main',
  title: 'About RPTRA Kebon Melati',
  subtitle: 'Ruang Publik Terpadu Ramah Anak yang berkomitmen menciptakan lingkungan aman dan mendukung perkembangan anak di Jakarta Pusat',
  mission: {
    title: 'Misi Kami',
    description: 'Menyediakan ruang aman untuk anak-anak dan keluarga dengan fasilitas pendidikan dan rekreasi.',
    image: '',
  },
  vision: {
    title: 'Visi',
    description: 'Menjadi ruang publik terdepan dalam mendukung perkembangan anak di Jakarta.',
  },
  values: {
    title: 'Nilai-Nilai',
    description: 'Keamanan, Pendidikan, Komunitas, dan Inovasi.',
  },
  programs: {
    title: 'Program Kami',
    description: 'Beragam program yang mendukung perkembangan anak dan kesejahteraan masyarakat.',
    items: [
      { name: 'Program Pendidikan Anak', description: 'Kegiatan belajar interaktif untuk anak usia dini.' },
      { name: 'Program Kesehatan Masyarakat', description: 'Edukasi kesehatan dan pemeriksaan rutin.' },
    ],
  },
  facilities: {
    title: 'Fasilitas',
    description: 'Fasilitas lengkap untuk mendukung kegiatan anak dan keluarga.',
    items: [
      { name: 'Ruang Bermain Anak', description: 'Area bermain yang aman dan menyenangkan.', image: '' },
      { name: 'Perpustakaan Mini', description: 'Koleksi buku untuk anak dan dewasa.', image: '' },
    ],
  },
  collaborations: {
    title: 'Kemitraan',
    description: 'Bekerjasama dengan berbagai pihak untuk meningkatkan kualitas layanan.',
    partners: [
      { name: 'Dinas Sosial DKI Jakarta', role: 'Pembina dan Pengawas' },
      { name: 'Puskesmas Setempat', role: 'Partner Kesehatan' },
    ],
  },
  operational: {
    title: 'Jam Operasional',
    hours: {
      senin: '06:00 - 13:00',
      selasa: '06:00 - 12:00',
      rabu: '06:00 - 12:00',
      kamis: '06:00 - 12:00',
      jumat: '06:00 - 13:00',
      sabtu: '08:00 - 14:00',
      minggu: '08:00 - 14:00',
    },
  },
  establishedYear: '2017',
  establishedText: 'Berdiri Sejak',
  lastUpdated: new Date(),
};

async function seedAbout() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB at', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));

    // Log environment variable for debugging
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');

    // Check collections
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('Collections:', collections?.map(col => col.name) || []);

    // Seed About collection
    const existingAbout = await About.findById('main');
    if (existingAbout) {
      console.log('About data with _id: main already exists, skipping...');
    } else {
      const newAbout = new About(aboutData);
      await newAbout.save();
      console.log('About data created successfully at', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    }

    // Verify seeded data
    const aboutDoc = await About.findById('main').lean();
    console.log('About data in collection:', aboutDoc ? 'Present' : 'Not present');

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    // Close connection after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

seedAbout().catch(error => {
  console.error('Seed process failed:', error);
  process.exit(1);
});