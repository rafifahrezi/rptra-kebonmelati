"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface EventItem {
  id: number | string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  images: string[]; // ubah image jadi array untuk slider
  status: "upcoming" | "ongoing" | "completed";
}

// Loading, Error, NoResultsState tetap sama (tidak diubah)
// Reusable Loading Component
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600">Memuat data...</p>
    </div>
  </div>
);

// Reusable Error Component
const ErrorState = ({ message }: { message: string }) => (
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
);

// Reusable No Results Component
const NoResultsState = () => (
  <div className="text-center py-12">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak ada kegiatan ditemukan</h3>
      <p className="text-gray-600 mb-6">Coba ubah kata kunci pencarian atau filter yang Anda gunakan</p>
    </div>
  </div>
);
const EventCard: React.FC<{ event: EventItem }> = ({ event }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status: EventItem["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: EventItem["status"]) => {
    switch (status) {
      case "upcoming":
        return "Akan Datang";
      case "ongoing":
        return "Sedang Berlangsung";
      case "completed":
        return "Selesai";
      default:
        return status;
    }
  };

  const images = Array.isArray(event.images) && event.images.length > 0 ? event.images : ["/images/fallback-image.png"];

  const prevImage = () => {
    setCurrentImageIndex((idx) => (idx === 0 ? images.length - 1 : idx - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((idx) => (idx === images.length - 1 ? 0 : idx + 1));
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <article
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
      aria-label={`Event: ${event.title}`}
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden select-none">
        {!imageError ? (
          <img
            src={images[currentImageIndex]}
            alt={`${event.title} - Gambar ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            Gambar tidak tersedia
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
          aria-label={`Status event: ${getStatusText(event.status)}`}
        >
          {getStatusText(event.status)}
        </span>

        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-xs font-medium text-gray-700">{event.category}</span>
        </div>

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Gambar sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Gambar selanjutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              type="button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded text-xs font-semibold select-none">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-green-600" aria-hidden="true" />
            <time dateTime={event.date}>{event.date}</time>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-600" aria-hidden="true" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

const Event: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // (Tidak diubah, hanya ganti tipe image ke array di fetch dan state)

  // Contoh fetchEvents menyesuaikan image array:
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Gagal mengambil data event");
      }
      const data: EventItem[] = await response.json();

      // Pastikan images adalah array
      const normalizedData = data.map((event) => ({
        ...event,
        images: Array.isArray(event.images) ? event.images : event.images ? [event.images] : [],
      }));

      setEvents(normalizedData);
      setFilteredEvents(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui");
    } finally {
      setLoading(false);
    }
  }, []);

  // ...filter dan render tetap sama, hanya ganti key dan props event.images...
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events based on search, category, and status
  const applyFilters = useCallback(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, events]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const categories = ["all", "Olahraga", "Edukasi", "Lingkungan", "Kuliner", "Seni"];
  const statuses = [
    { value: "all", label: "Semua Status" },
    { value: "upcoming", label: "Akan Datang" },
    { value: "ongoing", label: "Sedang Berlangsung" },
    { value: "completed", label: "Selesai" },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Kegiatan RPTRA Bonti</h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Bergabunglah dengan berbagai kegiatan menarik dan bermanfaat untuk seluruh keluarga
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari kegiatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "Semua Kategori" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
          // {/* Events Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{filteredEvents.length} Kegiatan Ditemukan</h2>
          <p className="text-gray-600">Temukan kegiatan yang sesuai dengan minat Anda</p>
        </div>

        {filteredEvents.length === 0 ? (
          <NoResultsState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const key = event.id !== undefined ? String(event.id) : `${event.title}-${event.date}`;
              return <EventCard key={key} event={event} />;
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Event;
