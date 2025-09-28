"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users, RefreshCw, AlertCircle, ImageIcon } from "lucide-react";

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

  // inside your component file (use the helpers you already have, e.g. buildImageFromRaw)

const fetchEvent = useCallback(async (signal?: AbortSignal) => {
  // Guard: don't call API when id is falsy/empty
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
    // encodeURIComponent protects against special chars in id
    const safeId = encodeURIComponent(id);

    const res = await fetch(`/api/events/${safeId}`, {
      method: "GET",
      cache: "no-store",
      signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      // try to parse JSON body (if any)
      let jsonErr: any = null;
      try { jsonErr = await res.json(); } catch { /* ignore parse errors */ }

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

    // Normalize images (server may return array of fileIds or objects)
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
    if (err?.name === "AbortError") {
      // request was aborted — ignore
      return;
    }
    console.error("fetchEvent error:", err);
    setError(err?.message ?? "Gagal memuat data kegiatan");
    setEvent(null);
  } finally {
    setLoading(false);
  }
}, [id]);


/* useEffect: only fetch when id is present/resolved */
useEffect(() => {
  // If useParams returns undefined while hydrating, keep loading until it's resolved.
  // If id is an empty string or falsy (resolved), show a helpful message.
  if (typeof id === "undefined") {
    // still resolving (do nothing; keep loading)
    return;
  }

  if (!id) {
    // param resolved but missing/empty -> show user-friendly error
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


  // Loading UI
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

  // Error / Not found
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

  // Success UI (kept your markup)
  return (
    <main className="min-h-screen bg-gray-50">
      {/* ... same markup as before, using `event` ... */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="px-4 py-2 rounded-full bg-white/10">
                <span className="text-sm font-medium">{event.status}</span>
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
            {event.images.length === 0 ? (
              <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <ImageIcon className="w-16 h-16" />
                <div className="ml-3">Tidak ada gambar</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <img src={event.images[0].url} alt={event.images[0].alt} className="w-full h-96 object-cover rounded-xl shadow" />
                {event.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {event.images.slice(1).map((img, idx) => (
                      <img key={img.fileId ?? img.url ?? idx} src={img.url} alt={img.alt} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <section className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold mb-4">{event.title}</h2>

            {event.description && (
              <div className="prose mb-6 text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
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
    </main>
  );
}
