import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "../lib/mongoose";
import Event from "../models/Event";

const eventsData = [
  {
    title: "Senam Pagi Bersama Warga",
    description:
      "Kegiatan olahraga bersama untuk meningkatkan kesehatan dan mempererat kebersamaan antarwarga di lingkungan RPTRA Kebon Melati.",
    category: "Olahraga",
    date: "2026-08-16",
    time: "07:00 - 08:30",
    location: "Lapangan RPTRA Kebon Melati",
    status: "upcoming",
    images: [],
  },
  {
    title: "Lomba Mewarnai Anak",
    description:
      "Lomba kreativitas mewarnai untuk anak usia 4–10 tahun dalam rangka mengembangkan imajinasi dan kreativitas.",
    category: "Anak",
    date: "2026-08-17",
    time: "09:00 - 11:30",
    location: "Aula RPTRA Kebon Melati",
    status: "upcoming",
    images: [],
  },
  {
    title: "Penyuluhan Pola Asuh Anak",
    description:
      "Sosialisasi mengenai pola asuh positif bersama narasumber dari psikolog dan kader PKK.",
    category: "Pendidikan",
    date: "2026-08-07",
    time: "13:00 - 15:00",
    location: "Ruang Serbaguna RPTRA",
    status: "upcoming",
    images: [],
  },
  {
    title: "Kerja Bakti Lingkungan",
    description:
      "Kegiatan gotong royong membersihkan lingkungan RPTRA dan area sekitar bersama warga.",
    category: "Lingkungan",
    date: "2026-08-09",
    time: "07:30 - 10:00",
    location: "Area RPTRA Kebon Melati",
    status: "upcoming",
    images: [],
  },
  {
    title: "Pelatihan Digital Marketing UMKM",
    description:
      "Pelatihan pemasaran digital bagi pelaku UMKM untuk meningkatkan kemampuan promosi produk secara online.",
    category: "UMKM",
    date: "2026-08-07",
    time: "09:00 - 12:00",
    location: "Aula RPTRA Kebon Melati",
    status: "upcoming",
    images: [],
  },
];

async function seedEvents() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log(
      'Connected to MongoDB at',
      new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
      })
    );

    // Log environment variable for debugging
    console.log(
      'MONGODB_URI:',
      process.env.MONGODB_URI ? 'Defined' : 'Undefined'
    );

    // Check collections
    const collections = await mongoose.connection.db
      ?.listCollections()
      .toArray();

    console.log(
      'Collections:',
      collections?.map((col) => col.name) || []
    );

    // Check existing event data
    const existingCount = await Event.countDocuments();

    if (existingCount > 0) {
      console.log(
        `Event collection already contains ${existingCount} document(s), skipping seeding...`
      );
    } else {
      await Event.insertMany(eventsData);

      console.log(
        `${eventsData.length} event(s) created successfully at`,
        new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
        })
      );
    }

    // Verify seeded data
    const totalEvents = await Event.countDocuments();

    console.log(
      'Event data in collection:',
      totalEvents > 0 ? `${totalEvents} document(s)` : 'Not present'
    );

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    // Close connection after a short delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await mongoose.connection.close();

    console.log('Database connection closed');

    process.exit(0);
  }
}

seedEvents().catch((error) => {
  console.error('Seed process failed:', error);
  process.exit(1);
});
  