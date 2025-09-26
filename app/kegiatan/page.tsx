"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Upload,
} from "lucide-react";

/* =========================
   Types
   ========================= */
interface EventItem {
  id: number | string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  category: string;
  participants?: number;
  maxParticipants?: number;
  images: string[]; // normalized to array
  status: "upcoming" | "ongoing" | "completed";
}

/* =========================
   Small reusable components
   ========================= */
const LoadingState: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600">Memuat data...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-2xl mb-4">⚠️</div>
      <p className="text-gray-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Muat Ulang
      </button>
    </div>
  </div>
);

const NoResultsState: React.FC = () => (
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

/* =========================
   Utilities
   ========================= */
const formatDateReadable = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* =========================
   Status helpers (centralized)
   - getStatusLabel: returns localized label
   - getStatusClass: returns styling classes for badges
   ========================= */
const getStatusLabel = (status: EventItem["status"]) => {
  switch (status) {
    case "upcoming":
      return "Akan Datang";
    case "ongoing":
      return "Sedang Berlangsung";
    case "completed":
      return "Selesai";
    default:
      return String(status);
  }
};

const getStatusClass = (status: EventItem["status"]) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ongoing":
      return "bg-green-100 text-green-800 border-green-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getImageUrl = (imageId: string): string => `/api/files/${imageId}`;
/* =========================
   ImageGallery (for modal) — show original-sized images (object-contain)
   - preserves aspect ratio
   - limited max height so UI stays intact
   - arrows to navigate
   ========================= */
const ImageGallery: React.FC<{
  images: string[];
  title: string;
}> = ({ images, title }) => {
  const [index, setIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  const safeImages = Array.isArray(images) && images.length > 0 ? images : ["/images/fallback-image.png"];

  const prev = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  };
  const next = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));
  };

  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <div>
      {/* Image container: preserve original via object-contain, limit max height */}
      <div className="w-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden relative max-h-96">
        {!imgError ? (
          <img
            src={getImageUrl(safeImages[index])} // Fixed: use index, not currentImageIndex
            alt={`${title} - Gambar ${index + 1}`}
            className="w-full h-full object-contain"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            Gambar tidak tersedia
          </div>
        )}

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Sebelumnya"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-white transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Selanjutnya"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-white transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
              {index + 1} / {safeImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail row (optional) */}
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={`flex-shrink-0 w-20 h-12 rounded-md overflow-hidden border ${i === index ? "ring-2 ring-green-500" : "border-gray-200"} focus:outline-none`}
              aria-label={`Pilih gambar ${i + 1}`}
            >
              <img src={getImageUrl(src)} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" onError={handleImageError} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================
   EventCard (grid item)
   - clicking card opens modal (onView)
   - card uses object-cover for listing thumbnails (kept small)
   ========================= */
const EventCard: React.FC<{ event: EventItem; onView: () => void }> = ({ event, onView }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  const images = Array.isArray(event.images) && event.images.length > 0 ? event.images : ["/images/fallback-image.png"];

  const prev = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const statusLabel = getStatusLabel(event.status);
  const statusColor = getStatusClass(event.status);

  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <article
      onClick={onView}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden focus-within:ring-2 focus-within:ring-green-400 cursor-pointer"
      aria-label={`Event ${event.title}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onView(); }}
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {!imgError ? (
          <img
            src={getImageUrl(images[imgIndex])} // Fixed: use imgIndex
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            Gambar tidak tersedia
          </div>
        )}

        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`} aria-hidden>
          {statusLabel}
        </span>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-gray-700">{event.category}</span>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(e); }}
              aria-label="Gambar sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(e); }}
              aria-label="Gambar selanjutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
              type="button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
              {imgIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">{event.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{event.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-green-600" />
            <time className="text-gray-700" dateTime={event.date}>
              {formatDateReadable(event.date)}
            </time>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">{event.location}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

/* =========================
   Main Page
   ========================= */
const Event: React.FC = () => {
  // Keep state & logic same as your original
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

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
      const normalized = data.map((ev) => ({
        ...ev,
        images: Array.isArray(ev.images) ? ev.images : ev.images ? [ev.images] : [],
      }));
      setEvents(normalized);
      setFilteredEvents(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filtering (kept same)
  const applyFilters = useCallback(() => {
    let filtered = [...events];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ev) => ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "all") filtered = filtered.filter((ev) => ev.category === selectedCategory);
    if (selectedStatus !== "all") filtered = filtered.filter((ev) => ev.status === selectedStatus as EventItem["status"]);
    setFilteredEvents(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, events]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // UI lists
  const categories = ["all", "Olahraga", "Edukasi", "Lingkungan", "Kuliner", "Seni"];
  const statuses = [
    { value: "all", label: "Semua Status" },
    { value: "upcoming", label: "Akan Datang" },
    { value: "ongoing", label: "Sedang Berlangsung" },
    { value: "completed", label: "Selesai" },
  ];

  const closeModal = () => setSelectedEvent(null);

  /* Render states */
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Kegiatan RPTRA Bonti</h1>
            <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Bergabunglah dengan berbagai kegiatan menarik dan bermanfaat untuk seluruh keluarga
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-xl w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari kegiatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all"
                aria-label="Cari kegiatan"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all"
                aria-label="Filter kategori"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Semua Kategori" : c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all"
                aria-label="Filter status"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{filteredEvents.length} Kegiatan Ditemukan</h2>
            <p className="text-gray-600">Temukan kegiatan yang sesuai dengan minat Anda</p>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <NoResultsState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((ev) => {
              const key = ev.id !== undefined ? String(ev.id) : `${ev.title}-${ev.date}`;
              return <EventCard key={key} event={ev} onView={() => setSelectedEvent(ev)} />;
            })}
          </div>
        )}
      </div>

      {/* Modal for Event Details */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Detail event ${selectedEvent.title}`}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold">Lihat Event</h3>
              <button
                onClick={closeModal}
                aria-label="Tutup"
                className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </header>

            <div className="p-6 space-y-6">
              <ImageGallery images={selectedEvent.images} title={selectedEvent.title} />

              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(selectedEvent.status)}`}>
                    {getStatusLabel(selectedEvent.status)}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{selectedEvent.category}</span>
                </div>

                <h4 className="text-2xl font-extrabold text-gray-900">{selectedEvent.title}</h4>

                {selectedEvent.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal</p>
                      <p className="font-medium text-gray-900">{formatDateReadable(selectedEvent.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-900">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
