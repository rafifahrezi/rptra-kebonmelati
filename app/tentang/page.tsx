
"use client";

import React, { memo, useState, useEffect, useCallback } from "react";
import { Users, Heart, Target, Award, MapPin, Clock, Play as Playground, Building2 } from "lucide-react";
import { useAboutData } from '@/hooks/useAboutData';
// Import types dari file terpisah
import { 
  AboutData, 
} from '@/types/AboutData';


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

const getImageUrl = (imageId: string): string => `/api/files/${imageId}`; 

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
                src={getImageUrl(mission.image)}
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
const FacilitiesSection = memo(({ facilities }: { facilities: AboutData["facilities"] }) => {
  const placeholders = {
    square: "https://placehold.co/400x400/4ade80/white?text=Fasilitas+RPTRA",
    portrait: "https://placehold.co/400x600/4ade80/white?text=Fasilitas+RPTRA",
  };

  const imageSlots = [
    { 
      index: 0, 
      placeholder: placeholders.square, 
      aspect: "aspect-square",
      size: "400x400"
    },
    { 
      index: 1, 
      placeholder: placeholders.square, 
      aspect: "aspect-square",
      size: "400x400"
    },
    { 
      index: 2, 
      placeholder: placeholders.portrait, 
      aspect: "aspect-[2/3]",
      size: "400x600"
    },
    { 
      index: 3, 
      placeholder: placeholders.square, 
      aspect: "aspect-square",
      size: "400x400"
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {facilities.title || "Fasilitas Kami"}
          </h2>
          {facilities.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {facilities.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Daftar Fasilitas
              </h3>
              {facilities.items.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {facilities.items.map((facility, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-green-50 transition-all duration-300 group"
                    >
                      <div className="flex-shrink-0 w-3 h-3 bg-green-400 rounded-full mt-2 group-hover:bg-green-600 transition-colors"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                          {facility.name}
                        </h4>
                        {facility.description && (
                          <p className="text-gray-600 leading-relaxed">
                            {facility.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Informasi fasilitas sedang dalam pengembangan</p>
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 lg:space-y-6">
                <div className={`group relative ${imageSlots[0].aspect} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500`}>
                  <img
                    src={facilities.images[0] ? getImageUrl(facilities.images[0]) : imageSlots[0].placeholder}
                    alt="Fasilitas 1"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = imageSlots[0].placeholder;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    </div>
                  </div>
                  {!facilities.images[0] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                      <span className="text-gray-400 text-sm">Slot 1</span>
                    </div>
                  )}
                </div>
                <div className={`group relative ${imageSlots[1].aspect} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500`}>
                  <img
                    src={facilities.images[1] ? getImageUrl(facilities.images[1]) : imageSlots[1].placeholder}
                    alt="Fasilitas 2"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = imageSlots[1].placeholder;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    </div>
                  </div>
                  {!facilities.images[1] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                      <span className="text-gray-400 text-sm">Slot 2</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4 lg:space-y-6">
                <div className={`group relative ${imageSlots[2].aspect} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500`}>
                  <img
                    src={facilities.images[2] ? getImageUrl(facilities.images[2]) : imageSlots[2].placeholder}
                    alt="Fasilitas 3"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = imageSlots[2].placeholder;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    </div>
                  </div>
                  {!facilities.images[2] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                      <span className="text-gray-400 text-sm">Slot 3</span>
                    </div>
                  )}
                </div>
                <div className={`group relative ${imageSlots[3].aspect} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500`}>
                  <img
                    src={facilities.images[3] ? getImageUrl(facilities.images[3]) : imageSlots[3].placeholder}
                    alt="Fasilitas 4"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = imageSlots[3].placeholder;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    </div>
                  </div>
                  {!facilities.images[3] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                      <span className="text-gray-400 text-sm">Slot 4</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Ingin Melihat Fasilitas Kami Secara Langsung?
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Datang dan nikmati berbagai fasilitas terbaik kami yang dirancang untuk kenyamanan Anda dan keluarga
            </p>
            <a  href="/permohonan" target="_blank" 
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
              Jadwalkan Kunjungan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

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
  const { 
    aboutData, 
    loading, 
    error, 
    refetch 
  } = useAboutData();

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