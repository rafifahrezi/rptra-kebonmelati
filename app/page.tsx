'use client';

import React, { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Heart, Book, Activity, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button"
import VisitsSection from "@/components/VisitsSection";

// Type Definitions
interface RptraStatus {
  status: boolean;
  updatedAt: string | null;
  updatedBy: string;
}

interface Visit {
  id: string;
  date: Date;
  balita: number;
  anak: number;
  remaja: number;
  dewasa: number;
  lansia: number;
}

// Hero Slide Type
interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

interface EventItem {
  _id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  images: string[];
  status: "upcoming" | "ongoing" | "completed";
}


// StatsCard Component
const StatsCard = memo(({ title, value, color = 'green' }: { title: string; value: number; color?: string }) => {
  const colorClasses = {
    green: 'text-green-600',
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 uppercase tracking-wide">{title}</h3>
      <p className={`text-4xl font-bold ${colorClasses[color as keyof typeof colorClasses] || 'text-green-600'}`}>{value}</p>
      <div className="mt-2 text-sm text-gray-500">kunjungan</div>
    </div>
  );
});

// Hero Section Component
const HeroSection = memo(({ heroSlides }: { heroSlides: HeroSlide[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  return (
    <section className="relative h-[600px] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">{slide.title}</h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">{slide.subtitle}</p>
              <Button size="lg" className="animate-bounce-in">
                Gabung Sekarang
              </Button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        aria-label="Slide berikutnya"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
            aria-label={`Slide ke-${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
});

// RptraStatus Section
const RptraStatusSection = memo(({ rptraStatus, formatDateOnly }: { rptraStatus: RptraStatus | null; formatDateOnly: (dateString: string | null) => string }) => (
  <section className="py-8 bg-gray-50">
    <div className="container mx-auto px-4 text-center">
      {rptraStatus === null ? (
        <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full">Memuat status...</span>
      ) : (
        <div className="inline-block px-4 py-2 rounded-full font-semibold bg-white shadow-md">
          <span className={`px-3 py-1 rounded-full ${rptraStatus.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {rptraStatus.status ? 'Sedang Buka' : 'Sedang Tutup'}
          </span>
          <div className="text-sm text-gray-600 mt-1 flex flex-col sm:flex-row gap-2 justify-center items-center">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDateOnly(rptraStatus.updatedAt)}</span>
          </div>
        </div>
      )}
    </div>
  </section>
));

// About Section
const AboutSection = memo(() => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Tentang RPTRA
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          RPTRA adalah Ruang Publik Terpadu Ramah Anak yang berfungsi sebagai tempat bermain, belajar, dan beraktivitas sosial untuk keluarga.
        </p>
        <Link href="/about">
          <Button variant="outline" size="lg">
            Selengkapnya
          </Button>
        </Link>
      </div>
    </div>
  </section>
));

// Features Section
const FeaturesSection = memo(({ features }: { features: { icon: React.ElementType; title: string; description: string }[] }) => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

// Events Section
const EventsSection = memo(() => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Kegiatan Terbaru</h2>
        <Link href="/events">
          <Button variant="outline">
            Lihat Semua
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500"></div>
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span>15 Februari 2025</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Senam Merdeka Minggu Pagi
              </h3>
              <p className="text-gray-600 mb-4">
                Kegiatan senam bersama untuk memperingati kemerdekaan Indonesia.
              </p>
              <Button size="sm" variant="outline">
                Selengkapnya
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

// Location Section
const LocationSection = memo(() => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Lokasi RPTRA
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start space-x-3 mb-4">
                <MapPin className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Alamat Lengkap</h3>
                  <p className="text-gray-600">
                    Jl. H. Awaludin IV, RT.3/RW.17<br />
                    Kebon Melati, Tanah Abang<br />
                    Jakarta Pusat 10230
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>Akses transportasi umum tersedia</p>
              </div>
            </div>
          </div>
            <div className="mt-6 h-64 bg-gray-300 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.479640730367!2d106.8142379!3d-6.2002777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f6a1a8e9fd37%3A0xfd41c3867e738112!2sRPTRA%20Kebon%20Melati!5e0!3m2!1sid!2sid!4v1755798002460!5m2!1sid!2sid"
              width="100%"
              height="100%"
              className="border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
));

// CTA Section
const CtaSection = memo(() => (
  <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Bergabunglah dengan Komunitas Kami
      </h2>
      <p className="text-lg mb-8 opacity-90">
        Mari bersama-sama menciptakan lingkungan yang lebih baik untuk anak-anak Indonesia
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/events">
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 rounded-lg px-6 py-3 transform hover:scale-105"
          >
            Lihat Kegiatan
          </Button>
        </Link>
        <Link href="/contact">
          <Button
            size="lg"
            variant="outline"
            className="border-2 text-green-600 font-semibold shadow-md hover:shadow-lg hover:bg-green-50 transition-all duration-200 rounded-lg px-6 py-3 transform hover:scale-105"
          >
            Hubungi Kami
          </Button>
        </Link>
      </div>
    </div>
  </section>
));

export default function Home() {
  const [rptraStatus, setRptraStatus] = useState<RptraStatus | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);

  // Mock data
  const heroSlides: HeroSlide[] = [
    {
      image: 'https://images.pexels.com/photos/1094072/pexels-photo-1094072.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800',
      title: 'Selamat Datang di RPTRA',
      subtitle: 'Tempat bermain dan belajar anak-anak Indonesia'
    },
    {
      image: 'https://images.pexels.com/photos/1350560/pexels-photo-1350560.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800',
      title: 'Bermain & Belajar Bersama',
      subtitle: 'Fasilitas playground modern dan ruang edukasi yang aman'
    },
    {
      image: 'https://images.pexels.com/photos/1094081/pexels-photo-1094081.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800',
      title: 'Komunitas yang Peduli',
      subtitle: 'Bergabung dengan kegiatan komunitas yang memberdayakan keluarga'
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Kegiatan Komunitas',
      description: 'Program reguler seperti senam merdeka, jumat curhat, dan kegiatan sosial lainnya'
    },
    {
      icon: Heart,
      title: 'Literasi Kesehatan',
      description: 'Edukasi kesehatan dan program makanan bersubsidi untuk keluarga'
    },
    {
      icon: Book,
      title: 'Pendidikan Anak',
      description: 'Ruang belajar dan program edukasi yang mendukung perkembangan anak'
    },
    {
      icon: Activity,
      title: 'Fasilitas Rekreasi',
      description: 'Playground, taman, dan area bermain yang aman dan menyenangkan'
    }
  ];

  // Ambil status dari API operasional
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/operasional');
        if (!res.ok) throw new Error('Gagal mengambil data operasional');
        const data = await res.json();
        setRptraStatus(data);
      } catch (error) {
        console.error(error);
        setRptraStatus({ status: false, updatedAt: null, updatedBy: 'system' });
      }
    };
    fetchStatus();
  }, []);


  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
    }).format(date);
  };

  // Example date for calculations
  const now = new Date('2025-08-31T23:37:00');

  const todayStr = now.toISOString().slice(0, 10);
  const currentMonth = todayStr.slice(0, 7);
  const currentYear = todayStr.slice(0, 4);

  const getWeekRange = (date: Date) => {
    const day = date.getDay();
    const diffToSunday = date.getDate() - day;
    const start = new Date(date);
    start.setDate(diffToSunday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  };

  const [dailyVisits, setDailyVisits] = useState(0);
  const [weeklyVisits, setWeeklyVisits] = useState(0);
  const [monthlyVisits, setMonthlyVisits] = useState(0);
  const [yearlyVisits, setYearlyVisits] = useState(0);


  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setDailyVisits(data.daily || 0);
      setWeeklyVisits(data.weekly || 0);
      setMonthlyVisits(data.monthly || 0);
      setYearlyVisits(data.yearly || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  

  return (
    <div className="min-h-screen">
      <HeroSection heroSlides={heroSlides} />

      <RptraStatusSection rptraStatus={rptraStatus} formatDateOnly={formatDateOnly} />

      <AboutSection />
      <FeaturesSection features={features} />
      <EventsSection />
      <VisitsSection />
      <LocationSection />
      <CtaSection />
    </div>
  );
}
