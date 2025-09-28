"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Calendar,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

// --- Reuse from main gallery page ---
interface GalleryItem {
  id: number | string;
  title: string;
  description: string;
  images: string[]; // array of GridFS file IDs
  category: string;
  date: string;
  status: "draft" | "published" | "archived";
}

// --- Helper: Generate image URL from GridFS ID ---
const getImageUrl = (id: string): string => {
  if (!id || id.trim() === "") return "/placeholder-image.jpg";
  return `/api/files/${encodeURIComponent(id)}`;
};

// --- Reusable States ---
const LoadingState: React.FC = () => (
  <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-t-xl" />
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
      <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Galeri</h2>
      <p className="text-red-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
        <Button asChild>
          <Link href="/galeri">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Galeri
          </Link>
        </Button>
      </div>
    </div>
  </div>
);

const NotFoundState: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
      <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Galeri Tidak Ditemukan</h2>
      <p className="text-gray-600 mb-6">Galeri yang Anda cari tidak tersedia atau telah dihapus.</p>
      <Button asChild>
        <Link href="/galeri">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Galeri
        </Link>
      </Button>
    </div>
  </div>
);

// --- Enhanced Image Component (accepts ID, not URL) ---
const GalleryImage: React.FC<{
  id: string; // GridFS file ID
  alt: string;
  className?: string;
  onError?: () => void;
  loading?: "lazy" | "eager";
}> = ({ id, alt, className = "", onError, loading = "lazy" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
    onError?.();
  }, [onError]);

  const handleLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-500">Gambar tidak dapat dimuat</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}
      <img
        src={getImageUrl(id)}
        alt={alt}
        className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
        decoding="async"
      />
    </div>
  );
};

// --- Image Modal (uses IDs, not raw URLs) ---
const ImageModal: React.FC<{
  imageIds: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}> = ({ imageIds, initialIndex, isOpen, onClose, title }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const prev = useCallback(() => setCurrentIndex((i) => (i === 0 ? imageIds.length - 1 : i - 1)), [imageIds.length]);
  const next = useCallback(() => setCurrentIndex((i) => (i === imageIds.length - 1 ? 0 : i + 1)), [imageIds.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    },
    [onClose, prev, next]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-[90vh] w-full animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative">
          <GalleryImage
            id={imageIds[currentIndex]}
            alt={`${title} - Gambar ${currentIndex + 1}`}
            className="w-full max-h-[70vh] object-contain"
            loading="eager"
          />

          {imageIds.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Gambar sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Gambar selanjutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {imageIds.length}
          </div>
        </div>

        {imageIds.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 justify-center">
            {imageIds.map((id, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-600 hover:border-gray-400"
                }`}
                aria-label={`Pilih gambar ${i + 1}`}
              >
                <GalleryImage id={id} alt={`Thumb ${i + 1}`} className="w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page ---
export default function GalleryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [gallery, setGallery] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const fetchGallery = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 404) {
        throw new Error("Galeri tidak ditemukan");
      }
      if (!res.ok) {
        throw new Error(`Gagal memuat galeri (HTTP ${res.status})`);
      }

      const data = await res.json();
      // Ensure images is array of strings (file IDs)
      setGallery({
        ...data,
        id: data._id || id,
        images: Array.isArray(data.images) ? data.images : [],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan tak terduga";
      setError(msg);
      console.error("Gallery detail error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const openModal = (index: number) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchGallery} />;
  if (!gallery) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                {gallery.category}
              </Badge>
              {gallery.status !== "published" && (
                <Badge variant="secondary" className="bg-white/90 text-gray-900 px-4 py-2 text-sm font-medium capitalize">
                  {gallery.status}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{gallery.title}</h1>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Koleksi foto dari kegiatan ini di RPTRA Kebon Melati
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button variant="outline" asChild className="shadow-sm hover:shadow-md">
              <Link href="/galeri">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Galeri
              </Link>
            </Button>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-gray-600">
                {new Date(gallery.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {gallery.description && (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {gallery.description}
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>{gallery.images.length} foto</span>
            </div>
          </div>

          {/* Image Grid */}
          {gallery.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gallery.images.map((imageId, index) => (
                <div
                  key={imageId || index}
                  className="group cursor-pointer"
                  onClick={() => openModal(index)}
                >
                  <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 group-hover:scale-[1.02]">
                    <GalleryImage
                      id={imageId}
                      alt={`${gallery.title} - Foto ${index + 1}`}
                      className="aspect-square w-full"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Card className="max-w-md mx-auto p-8 bg-white border border-gray-200">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="font-medium text-gray-900">Tidak Ada Foto</h3>
                <p className="text-gray-600 text-sm mt-1">Galeri ini belum memiliki foto.</p>
              </Card>
            </div>
          )}

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="shadow hover:shadow-md">
              <Link href="/galeri">Jelajahi Galeri Lainnya</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ImageModal
        imageIds={gallery.images}
        initialIndex={modalIndex}
        isOpen={modalOpen}
        onClose={closeModal}
        title={gallery.title}
      />
    </div>
  );
}