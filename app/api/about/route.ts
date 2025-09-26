import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongoose';
import About from '@/models/About';

const defaultAboutData = {
  _id: 'main',
  title: 'About RPTRA Kebon Melati',
  subtitle: 'Ruang Publik Terpadu Ramah Anak yang berkomitmen menciptakan lingkungan aman dan mendukung perkembangan anak di Jakarta Pusat',
  mission: { title: 'Misi Kami', description: 'Menyediakan ruang aman ...', image: '' },
  vision: { title: 'Visi', description: 'Menjadi ruang publik terdepan ...' },
  values: { title: 'Nilai-Nilai', description: 'Keamanan, Pendidikan, ...' },
  programs: {
    title: 'Program Kami',
    description: 'Beragam program yang mendukung perkembangan anak ...',
    items: [
      { name: 'Program Pendidikan Anak', description: 'Kegiatan belajar ...' },
      { name: 'Program Kesehatan Masyarakat', description: 'Edukasi kesehatan ...' },
    ],
  },
  facilities: {
    title: 'Fasilitas',
    description: 'Fasilitas lengkap ...',
    items: [
      { name: 'Ruang Bermain Anak', description: 'Area bermain ...' },
      { name: 'Perpustakaan Mini', description: 'Koleksi buku ...' },
    ],
  },
  collaborations: {
    title: 'Kemitraan',
    description: 'Bekerjasama dengan berbagai pihak ...',
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let about = await About.findById('main');
    
    if (!about) {
      about = new About(defaultAboutData);
      await about.save();
    }

    return NextResponse.json({ 
      success: true,
      about 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error) {
    console.error('GET about error:', error);
    
    // Tangani error dengan lebih spesifik
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Terjadi kesalahan server' 
    }, { 
      status: 500 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Token tidak ditemukan' }, { status: 401 });
    }
    jwt.verify(token, process.env.JWT_SECRET as string);

    const data = await request.json();
    await connectDB();
    const about = await About.findById('main');
    if (!about) {
      return NextResponse.json({ message: 'About data tidak ditemukan' }, { status: 404 });
    }
    Object.assign(about, { ...data, lastUpdated: new Date() });
    await about.save();
    return NextResponse.json({ about });
  } catch (error) {
    console.error('POST about error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}