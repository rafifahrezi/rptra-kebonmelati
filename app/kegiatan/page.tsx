"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


/* =========================
   Types
   ========================= */
interface EventRaw {
  // server may supply _id or id, images may be array of strings or objects
  _id?: string;
  id?: string | number;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  category?: string;
  participants?: number;
  maxParticipants?: number;
  images?: Array<string | { fileId?: string; url?: string; filename?: string }>;
  status?: "upcoming" | "ongoing" | "completed" | "finished";
}

interface EventItem {
  id: string; // normalized id (string)
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  category: string;
  participants?: number;
  maxParticipants?: number;
  images: string[]; // normalized to array of image identifiers or URLs
  status: "upcoming" | "ongoing" | "completed" | "finished";
}

/* =========================
   Small reusable components
   ========================= */
const LoadingState: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Memuat data...</p>
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
   ========================= */
const getStatusLabel = (status: EventItem["status"]) => {
  switch (status) {
    case "upcoming":
      return "Akan Datang";
    case "ongoing":
      return "Sedang Berlangsung";
    case "completed":
    case "finished":
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
    case "finished":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * getImageUrl
 * - If `identifier` already looks like a full URL (http / https / data: / /api/...), return as-is.
 * - Otherwise assume it's a GridFS fileId (or similar) and return `/api/files/{id}`.
 * - Prevent returning `/api/files/undefined` by guarding falsy values.
 */
const getImageUrl = (identifier?: string): string => {
  if (!identifier) return "/images/fallback-image.png";
  const trimmed = String(identifier).trim();
  if (!trimmed) return "/images/fallback-image.png";
  // full URLs or data URIs or already starting with /api/files
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || trimmed.startsWith("/api/") || trimmed.startsWith("/images/")) {
    return trimmed;
  }
  // otherwise treat as file id -> GridFS endpoint
  return `/api/files/${encodeURIComponent(trimmed)}`;
};

/* =========================
   ImageGallery (for modal) — show original-sized images (object-contain)
   ========================= */
const ImageGallery: React.FC<{
  images: string[];
  title: string;
}> = ({ images, title }) => {
  const [index, setIndex] = useState(0);
  const [imgErrorIndex, setImgErrorIndex] = useState<number | null>(null);

  const safeImages = Array.isArray(images) && images.length > 0 ? images : ["/images/fallback-image.png"];

  const prev = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  };
  const next = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));
  };

  return (
    <div>
      <div className="w-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden relative max-h-96">
        {imgErrorIndex === index ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            Gambar tidak tersedia
          </div>
        ) : (
          <img
            src={getImageUrl(safeImages[index])}
            alt={`${title} - Gambar ${index + 1}`}
            className="w-full h-full object-contain"
            onError={() => setImgErrorIndex(index)}
            loading="lazy"
          />
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

      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={`flex-shrink-0 w-20 h-12 rounded-md overflow-hidden border ${i === index ? "ring-2 ring-green-500" : "border-gray-200"} focus:outline-none`}
              aria-label={`Pilih gambar ${i + 1}`}
            >
              <img src={getImageUrl(src)} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================
   EventCard
   - If id is missing we render a non-clickable card (no link to `/kegiatan/undefined`)
   ========================= */
const EventCard: React.FC<{ event: EventItem }> = ({ event }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const images = Array.isArray(event.images) && event.images.length > 0 ? event.images : ["/images/fallback-image.png"];
  const statusLabel = getStatusLabel(event.status);
  const statusColor = getStatusClass(event.status);

  const hasValidId = Boolean(event.id && event.id !== "undefined");

  const CardInner = (
    <>
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={getImageUrl(images[imgIndex])}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${statusColor} shadow-sm`} aria-hidden>
          {statusLabel}
        </span>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-gray-700">{event.category}</span>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1)); }}
              aria-label="Gambar sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1)); }}
              aria-label="Gambar selanjutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
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
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{event.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
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
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">{event.time}</span>
          </div>
        </div>
        

        {hasValidId ? (
          <Link
            href={`/kegiatan/${encodeURIComponent(event.id)}`}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors group/btn"
          >
            Lihat Selengkapnya
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-gray-400 font-medium text-sm" title="ID event tidak tersedia">
            Lihat Selengkapnya
            <ArrowRight className="w-4 h-4 opacity-50" />
          </span>
        )}
      </div>
    </>
  );

  return (
    <article
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group focus-within:ring-2 focus-within:ring-green-400 transform hover:-translate-y-1"
      aria-label={`Event ${event.title}`}
    >
      {CardInner}
    </article>
  );
};

/* =========================
   Main Page
   ========================= */
const Event: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeRawToItem = (raw: EventRaw): EventItem | null => {
    // prefer _id, then id; ensure final id is string and not "undefined"
    const rawId = raw._id ?? raw.id;
    const normalizedId = rawId !== undefined && rawId !== null ? String(rawId) : null;
    if (!normalizedId || normalizedId === "undefined") {
      // Return null for items without stable id — still possible to include, but safer to skip
      // If you prefer to keep items without id in listing, change to provide fallback id strategy
      return null;
    }

    // images: support array of strings or objects with fileId / url
    const normalizedImages: string[] = Array.isArray(raw.images)
      ? raw.images.map((img) => {
        if (!img) return "/images/fallback-image.png";
        if (typeof img === "string") return img;
        if (typeof img === "object") return (img.url ?? img.fileId ?? img.filename ?? "/images/fallback-image.png");
        return "/images/fallback-image.png";
      }).filter(Boolean)
      : [];

    return {
      id: normalizedId,
      title: raw.title ?? "Tanpa Judul",
      description: raw.description ?? "",
      date: raw.date ?? new Date().toISOString(),
      time: raw.time,
      location: raw.location ?? "-",
      category: raw.category ?? "-",
      participants: typeof raw.participants === "number" ? raw.participants : undefined,
      maxParticipants: typeof raw.maxParticipants === "number" ? raw.maxParticipants : undefined,
      images: normalizedImages.length > 0 ? normalizedImages : ["/images/fallback-image.png"],
      status: (raw.status as EventItem["status"]) ?? "upcoming",
    };
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Gagal mengambil data event");
      }
      const dataRaw = await response.json();

      // Support API returning { success, events, pagination } or a plain array
      const serverList: EventRaw[] = Array.isArray(dataRaw)
        ? dataRaw
        : Array.isArray(dataRaw.events)
          ? dataRaw.events
          : [];

      // Normalize & drop items without valid id (prevents '/kegiatan/undefined' links)
      const normalized = serverList.map(normalizeRawToItem).filter((x): x is EventItem => x !== null);

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

      // {/* Filter */}
      <div className="sticky top-0 z-20 inset-x-0 bg-white shadow-lg rounded-b-2xl -mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full max-w-3xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" aria-hidden="true" />
              <Input
                placeholder="Cari kegiatan, acara, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm transition-all duration-300 bg-white hover:shadow-md focus:shadow-md text-gray-700"
                aria-label="Cari kegiatan"
              />
            </div>
            {/* Filters Container */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory} aria-label="Filter kategori">
                <SelectTrigger className="w-full min-w-[160px] lg:w-48 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm transition-all duration-300 bg-white hover:shadow-md focus:shadow-md text-gray-700">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "all" ? "Semua Kategori" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus} aria-label="Filter status">
                <SelectTrigger className="w-full min-w-[160px] lg:w-48 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 shadow-sm transition-all duration-300 bg-white hover:shadow-md focus:shadow-md text-gray-700">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {filteredEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Event;
