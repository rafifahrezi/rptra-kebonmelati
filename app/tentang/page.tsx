"use client";

import React, { memo, useState, useEffect, useCallback } from "react";
import { Users, Heart, Target, Award, MapPin, Clock, Play as Playground, Building2 } from "lucide-react";

// Define the AboutData interface
interface AboutData {
  title: string;
  subtitle: string;
  mission: {
    title: string;
    description: string;
    image: string;
  };
  vision: {
    title: string;
    description: string;
  };
  values: {
    title: string;
    description: string;
  };
  programs: {
    title: string;
    description: string;
    items: {
      name: string;
      description: string;
    }[];
  };
  facilities: {
    title: string;
    description: string;
    items: {
      name: string;
      description: string;
    }[];
  };
  collaborations: {
    title: string;
    description: string;
    partners: {
      name: string;
      role: string;
    }[];
  };
  operational: {
    title: string;
    hours: {
      senin: string;
      selasa: string;
      rabu: string;
      kamis: string;
      jumat: string;
      sabtu: string;
      minggu: string;
    };
  };
  establishedYear: string;
  establishedText: string;
  lastUpdated: string;
}

// Reusable Loading Component
const LoadingState = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600">Memuat data...</p>
    </div>
  </div>
));

// Reusable Error Component
const ErrorState = memo(({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-xl mb-4">⚠️</div>
      <p className="text-gray-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
      >
        Muat Ulang
      </button>
    </div>
  </div>
));

// Reusable No Data Component
const NoDataState = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-600">Data tidak tersedia</p>
    </div>
  </div>
));

// Hero Section Component
const HeroSection = memo(({ title, subtitle }: { title: string; subtitle: string }) => (
  <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
        <p className="text-xl opacity-90 mb-8">{subtitle}</p>
      </div>
    </div>
  </section>
));

// Mission & Vision Section Component
const MissionVisionSection = memo(
  ({
    mission,
    vision,
    values,
    establishedYear,
    establishedText,
  }: {
    mission: AboutData["mission"];
    vision: AboutData["vision"];
    values: AboutData["values"];
    establishedYear: string;
    establishedText: string;
  }) => (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{mission.title}</h2>
            <p className="text-lg text-gray-600 mb-8">{mission.description}</p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{vision.title}</h3>
                  <p className="text-gray-600">{vision.description}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{values.title}</h3>
                  <p className="text-gray-600">{values.description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-lg">
              <img
                src={mission.image || "https://placehold.co/600x400"}
                alt={mission.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/400";
                }}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{establishedYear}</div>
                <div className="text-sm text-gray-600">{establishedText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
);

// Programs Section Component
const ProgramsSection = memo(({ programs }: { programs: AboutData["programs"] }) => {
  const programIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    "Literasi Kesehatan": Heart,
    "Kegiatan Komunitas": Users,
    "Program Anak": Playground,
    "Pemberdayaan Masyarakat": Building2,
    "Program Pendidikan": Target,
    "Program Kesehatan": Heart,
  };

  const getProgramIcon = (programName: string): React.ComponentType<{ className?: string }> => {
    const foundIcon = Object.keys(programIcons).find((key) =>
      programName.toLowerCase().includes(key.toLowerCase())
    );
    return programIcons[foundIcon || ""] || Building2;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{programs.title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{programs.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.items.length > 0 ? (
            programs.items.map((program, index) => {
              const IconComponent = getProgramIcon(program.name);
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{program.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{program.description}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500">
              <p>Belum ada program yang tersedia</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

// Facilities Section Component
const FacilitiesSection = memo(({ facilities }: { facilities: AboutData["facilities"] }) => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{facilities.title}</h2>
          <p className="text-lg text-gray-600 mb-8">{facilities.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facilities.items.length > 0 ? (
              facilities.items.map((facility, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                  <div>
                    <span className="font-medium text-gray-900">{facility.name}</span>
                    {facility.description && <p className="text-sm text-gray-600 mt-1">{facility.description}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-500">
                <p>Informasi fasilitas belum tersedia</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-md">
              <img src="https://placehold.co/400" alt="Playground" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-md">
              <img src="https://placehold.co/400" alt="Reading Area" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-md">
              <img src="https://placehold.co/400x600.png" alt="Garden Area" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-md">
              <img src="https://placehold.co/400" alt="Meeting Room" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));

// Partners Section Component
const PartnersSection = memo(({ collaborations }: { collaborations: AboutData["collaborations"] }) => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{collaborations.title}</h2>
          <p className="text-lg text-gray-600">{collaborations.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.partners.length > 0 ? (
            collaborations.partners.map((partner, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{partner.name}</h3>
                {partner.role && <p className="text-sm text-gray-600">{partner.role}</p>}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              <p>Informasi mitra belum tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
));

// Hours & Location Section Component
const HoursLocationSection = memo(({ operational }: { operational: AboutData["operational"] }) => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-lg">
          <div className="flex items-center mb-4">
            <Clock className="w-8 h-8 mr-3" />
            <h3 className="text-2xl font-bold">{operational.title}</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(operational.hours).map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="capitalize">{day}</span>
                <span>{hours}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <p className="text-sm opacity-90">*Beberapa fasilitas mungkin memiliki jam operasional berbeda</p>
          </div>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg">
          <div className="flex items-center mb-4">
            <MapPin className="w-8 h-8 mr-3 text-green-600" />
            <h3 className="text-2xl font-bold text-gray-900">Lokasi</h3>
          </div>
          <div className="space-y-2 text-gray-700">
            <p>Jl. H. Awaludin IV, RT.3/RW.17</p>
            <p>Kebon Melati, Tanah Abang</p>
            <p>Jakarta Pusat 10230</p>
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
          <div className="mt-6 pt-6 border-t border-gray-300">
            <p className="text-sm text-gray-600">Mudah diakses dengan transportasi umum.</p>
            <p className="text-sm text-gray-600">Dekat dengan stasiun Karet hanya berjarak ±290m.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
));

// Main About Component
const About = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API with authentication check
  const fetchAboutData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/about", {
        credentials: "include", // Include cookies for token
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          setError("Akses ditolak: Token tidak ditemukan atau tidak valid");
        } else {
          setError(`Gagal memuat data: ${errorText || "Terjadi kesalahan server"}`);
        }
        return;
      }
      const result = await response.json();
      setAboutData(result.about || null); // Extract 'about' field from API response
    } catch (err) {
      console.error("Error fetching about data:", err);
      setError(`Gagal memuat data: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!aboutData) return <NoDataState />;

  return (
    <div className="min-h-screen">
      <HeroSection title={aboutData.title} subtitle={aboutData.subtitle} />
      <MissionVisionSection
        mission={aboutData.mission}
        vision={aboutData.vision}
        values={aboutData.values}
        establishedYear={aboutData.establishedYear}
        establishedText={aboutData.establishedText}
      />
      <ProgramsSection programs={aboutData.programs} />
      <FacilitiesSection facilities={aboutData.facilities} />
      <PartnersSection collaborations={aboutData.collaborations} />
      <HoursLocationSection operational={aboutData.operational} />
    </div>
  );
};

export default About;