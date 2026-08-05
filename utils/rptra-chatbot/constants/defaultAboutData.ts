import { AboutData } from '../types/AboutData';

export const DEFAULT_ABOUT_DATA: AboutData = {
  title: "Tentang Kami",
  subtitle: "Informasi Organisasi",
  mission: {
    title: "Misi Kami",
    description: "Deskripsi misi organisasi",
    image: "/default-mission.jpg"
  },
  vision: {
    title: "Visi Kami",
    description: "Deskripsi visi organisasi"
  },
  values: {
    title: "Nilai-Nilai Kami",
    description: "Deskripsi nilai-nilai organisasi"
  },
  programs: {
    title: "Program Kami",
    description: "Daftar program yang tersedia",
    items: []
  },
  facilities: {
    title: "Fasilitas",
    description: "Daftar fasilitas",
    items: [],
    images: []
  },
  collaborations: {
    title: "Kolaborasi",
    description: "Mitra dan kolaborasi",
    partners: []
  },
  operational: {
    title: "Jam Operasional",
    hours: "Belum tersedia"
  },
  establishedYear: new Date().getFullYear(),
  establishedText: "Didirikan",
  lastUpdated: new Date().toISOString()
};