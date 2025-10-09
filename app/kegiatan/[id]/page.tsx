"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users, RefreshCw, AlertCircle, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

/* ----- Types ----- */
interface EventImage {
  fileId?: string;
  url?: string;
  alt?: string;
  filename?: string;
}

interface EventApiShape {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  category?: string;
  participants?: number;
  maxParticipants?: number;
  images?: Array<string | EventImage>;
  status?: "upcoming" | "ongoing" | "finished" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

interface NormalizedEvent {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  category?: string;
  participants?: number;
  maxParticipants?: number;
  images: EventImage[];
  status: "upcoming" | "ongoing" | "finished" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

/* ----- Helpers ----- */
// normalize raw image entries (string fileId or object)
const buildImageFromRaw = (raw: string | EventImage | undefined, title?: string): EventImage | null => {
  if (!raw) return null;
  if (typeof raw === "string") {
    // treat as fileId
    return {
      fileId: raw,
      url: `/api/files/${encodeURIComponent(raw)}`,
      alt: title || "image",
      filename: raw,
    };
  }
  // object: prefer url if provided, otherwise build from fileId
  const fileId = (raw as EventImage).fileId;
  const url = (raw as EventImage).url ?? (fileId ? `/api/files/${encodeURIComponent(fileId)}` : undefined);
  if (!url) return null;
  return {
    fileId,
    url,
    alt: (raw as EventImage).alt ?? title ?? (raw as EventImage).filename ?? "image",
    filename: (raw as EventImage).filename,
  };
};

const formatDateReadable = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

const formatTimeReadable = (t?: string) => {
  if (!t) return "";
  try {
    if (t.includes("T")) {
      return new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    }
    return t;
  } catch {
    return t;
  }
};

/* ----- Component ----- */
export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [event, setEvent] = useState<NormalizedEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Image Modal Component
  const ImageModal = ({ images, initialIndex }: { images: EventImage[], initialIndex: number }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = useCallback(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const handlePrev = useCallback(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const currentImage = images[currentIndex];

    return (
      <div 
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={() => setSelectedImageIndex(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Image Viewer Modal"
      >
        <button 
          className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
          onClick={() => setSelectedImageIndex(null)}
          aria-label="Close modal"
        >
          <X className="w-8 h-8" />
        </button>

        <button 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>

        <div className="max-w-4xl max-h-[90vh] flex items-center justify-center">
          <img 
            src={currentImage.url} 
            alt={currentImage.alt} 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            loading="eager"
          />
        </div>

        <div className="absolute bottom-4 text-white text-center">
          <p>{currentImage.alt}</p>
          <p className="text-sm text-gray-300">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    );
  };

  const fetchEvent = useCallback(async (signal?: AbortSignal) => {
    if (!id) {
      setError("ID kegiatan tidak ada.");
      setIsNotFound(false);
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const safeId = encodeURIComponent(id);

      const res = await fetch(`/api/events/${safeId}`, {
        method: "GET",
        cache: "no-store",
        signal,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let jsonErr: any = null;
        try { jsonErr = await res.json(); } catch {}

        if (res.status === 400) {
          setError(jsonErr?.error ?? "Request tidak valid (ID mungkin tidak sesuai).");
          setIsNotFound(false);
          setEvent(null);
          setLoading(false);
          return;
        }

        if (res.status === 404) {
          setIsNotFound(true);
          setError(jsonErr?.error ?? "Kegiatan tidak ditemukan");
          setEvent(null);
          setLoading(false);
          return;
        }

        throw new Error(jsonErr?.error ?? `HTTP ${res.status} ${res.statusText}`);
      }

      const data: EventApiShape = await res.json();

      const rawImages = Array.isArray(data.images) ? data.images : [];
      const normalizedImages = rawImages
        .map((r) => buildImageFromRaw(r as any, data.title || ""))
        .filter((img): img is EventImage => !!img && !!img.url);

      const normalized: NormalizedEvent = {
        _id: (data._id as string) || (data.id as string) || id,
        title: data.title || "Tanpa Judul",
        description: data.description || "",
        date: data.date,
        time: data.time,
        location: data.location || "-",
        category: data.category || "-",
        participants: typeof data.participants === "number" ? data.participants : undefined,
        maxParticipants: typeof data.maxParticipants === "number" ? data.maxParticipants : undefined,
        images: normalizedImages,
        status: (data.status as NormalizedEvent["status"]) || "upcoming",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      setEvent(normalized);
      setError(null);
      setIsNotFound(false);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("fetchEvent error:", err);
      setError(err?.message ?? "Gagal memuat data kegiatan");
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (typeof id === "undefined") return;

    if (!id) {
      setLoading(false);
      setError("ID kegiatan tidak ditemukan di URL.");
      setEvent(null);
      setIsNotFound(false);
      return;
    }

    const controller = new AbortController();
    fetchEvent(controller.signal);
    return () => controller.abort();
  }, [id, fetchEvent]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail kegiatan...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    const label = isNotFound ? "Kegiatan lagi di cari" : "Sedang Memuat Kegiatan";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">{label}</p>
        </div>
      </div>
    );
  }

  // Refactored Image Gallery with best practices
  const renderImageGallery = () => {
    if (event.images.length === 0) {
      return (
        <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          <ImageIcon className="w-16 h-16" />
          <div className="ml-3">Tidak ada gambar</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Main photo - first image large */}
        <img
          src={event.images[0].url}
          alt={event.images[0].alt}
          onClick={() => setSelectedImageIndex(0)}
          className="w-full max-h-[600px] object-contain rounded-xl shadow-lg cursor-pointer hover:opacity-95 transition-opacity duration-200 mx-auto"
          loading="eager"
        />
        
        {/* Remaining photos below in responsive grid */}
        {event.images.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.images.slice(1).map((img, idx) => (
              <img
                key={img.fileId ?? img.url ?? idx}
                src={img.url}
                alt={img.alt}
                onClick={() => setSelectedImageIndex(idx + 1)}
                className="w-full h-auto max-h-[400px] object-contain rounded-xl shadow-md cursor-pointer hover:opacity-95 transition-opacity duration-200 mx-auto"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Markdown component with styling
  const MarkdownContent = ({ content }: { content: string }) => {
    return (
      <div className="prose prose-green max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mb-3">{children}</h3>,
            h4: ({ children }) => <h4 className="text-lg font-bold text-gray-900 mb-2">{children}</h4>,
            p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-4 text-gray-700">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 text-gray-700">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-600 my-4">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                {children}
              </pre>
            ),
            a: ({ children, href }) => (
              <a 
                href={href} 
                className="text-green-600 hover:text-green-700 underline break-words"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img 
                src={src} 
                alt={alt} 
                className="max-w-full h-auto rounded-lg my-4"
                loading="lazy"
              />
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-4 py-2">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="px-4 py-2 rounded-full bg-white/10">
                <span className="text-sm font-medium capitalize">{event.status}</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/10">
                <span className="text-sm font-medium">{event.category}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{event.title}</h1>
            <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto">
              {event.description ? (event.description.length > 140 ? `${event.description.slice(0, 140)}…` : event.description) : "Detail event tersedia di sini."}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/kegiatan">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Kegiatan
              </Link>
            </Button>
          </div>

          <div className="mb-8">
            {renderImageGallery()}
          </div>

          <section className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold mb-4">{event.title}</h2>

            {event.description && (
              <div className="mb-6 text-gray-700">
                <MarkdownContent content={event.description} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium text-gray-900">{formatDateReadable(event.date)}</p>
                  {event.time && <p className="text-sm text-gray-600">{formatTimeReadable(event.time)}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lokasi</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>

              {(event.participants !== undefined || event.maxParticipants !== undefined) && (
                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Partisipan</p>
                    <p className="font-medium text-gray-900">
                      {event.participants ?? 0}{event.maxParticipants ? ` dari ${event.maxParticipants}` : ""} orang
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Image Modal Rendering */}
      {selectedImageIndex !== null && event?.images && (
        <ImageModal 
          images={event.images} 
          initialIndex={selectedImageIndex} 
        />
      )}
    </main>
  );
}
