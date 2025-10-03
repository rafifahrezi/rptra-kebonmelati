"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  ImageIcon,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";

interface GalleryItem {
  id: number | string;
  title: string;
  description: string;
  images: string[];
  category: string;
  date: string;
  status: "draft" | "published" | "archived";
}

// New Video Item Interface
interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string; // YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
  date: string;
}

// Static Video Data
const staticVideos: VideoItem[] = [
  {
    id: "video1",
    title: "Kegiatan Senam Merdeka 2025",
    description: "Video highlight dari acara senam merdeka di RPTRA Kebon Melati, melibatkan komunitas lokal.",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    date: "2025-08-17",
  },
  {
    id: "video2",
    title: "Jumat Curhat Bersama Warga",
    description: "Dokumentasi kegiatan Jumat Curhat, berbagi cerita dan solusi bersama warga.",
    youtubeUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    date: "2025-07-10",
  },
  {
    id: "video3",
    title: "Workshop Literasi Kesehatan",
    description: "Rekaman workshop edukasi kesehatan untuk keluarga di RPTRA Kebon Melati.",
    youtubeUrl: "https://www.youtube.com/embed/3f5dAiyzLdw",
    date: "2025-06-15",
  },
];

const getImageUrl = (id: string): string => {
  if (!id || id.length === 0) return "/placeholder-image.jpg";
  return `/api/files/${id}`;
};

const formatDateForDisplay = (dateString: string | undefined): string => {
  if (!dateString) return "–";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "–";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Optimized Image Component
const GalleryImage: React.FC<{
  src: string;
  alt: string;
  title: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  loading?: "lazy" | "eager";
}> = ({ src, alt, title, className = "", onError, onLoad, loading = "lazy" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
    onError?.();
  }, [onError]);

  const handleLoad = useCallback(() => {
    setImageLoading(false);
    onLoad?.();
  }, [onLoad]);

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Gambar tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-t-xl" />
      )}
      <img
        src={getImageUrl(src)}
        alt={alt}
        title={title}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
      />
    </div>
  );
};

// Gallery Card
const GalleryCard: React.FC<{ item: GalleryItem }> = ({ item }) => {
  const primaryImage = item.images?.[0];
  const hasMultipleImages = item.images?.length > 1;

  return (
    <Card className="overflow-hidden group cursor-pointer rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square relative">
        {primaryImage ? (
          <GalleryImage
            src={primaryImage}
            alt={item.title}
            title={item.title}
            className="rounded-t-xl"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-t-xl">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <Badge variant="secondary" className="bg-white/90 text-gray-900 shadow-sm rounded-full px-3 py-1 text-xs font-medium">
            {item.category}
          </Badge>
          {item.status !== "published" && (
            <Badge
              variant={item.status === "draft" ? "outline" : "secondary"}
              className="capitalize shadow-sm rounded-full px-3 py-1 text-xs font-medium"
            >
              {item.status}
            </Badge>
          )}
          {hasMultipleImages && (
            <Badge variant="default" className="bg-blue-600 text-white shadow-sm rounded-full px-3 py-1 text-xs font-medium">
              +{item.images.length - 1}
            </Badge>
          )}
        </div>

        {/* Title Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
          <h3 className="text-white font-semibold text-sm line-clamp-2">{item.title}</h3>
          <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDateForDisplay(item.date)}
          </p>
        </div>
      </div>

      <div className="p-4">
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <Link href={`/galeri/${item.id}`}>
            Lihat Detail
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

// Video Card Component
const VideoCard: React.FC<{ item: VideoItem }> = ({ item }) => {
  return (
    <Card className="overflow-hidden group cursor-pointer rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-[16/9] relative">
        <iframe
          src={item.youtubeUrl}
          title={item.title}
          className="w-full h-full rounded-t-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
        <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDateForDisplay(item.date)}
        </p>
        <Button
          asChild
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-shadow rounded-lg"
        >
          <Link href={item.youtubeUrl} target="_blank" rel="noopener noreferrer">
            Tonton di YouTube
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gallery", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat galeri`);

      const data: any[] = await res.json();
      const sanitizedData = data.map((item) => ({
        ...item,
        id: item._id,
        images: Array.isArray(item.images) ? item.images : [],
      }));
      setGalleryItems(sanitizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const categories = useMemo(() => {
    const cats = new Set(galleryItems.map((item) => item.category.toLowerCase()));
    return ["all", ...Array.from(cats)];
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category.toLowerCase() === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && item.status === "published";
    });
  }, [galleryItems, selectedCategory, searchTerm]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
  }, []);

  // === Loading State ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat galeri...</p>
        </div>
      </div>
    );
  }

  // === Error State ===
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Galeri</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <Button onClick={fetchGallery} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  // === Main UI ===
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Galeri Foto</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            Jelajahi momen berharga dari kegiatan komunitas di RPTRA Kebon Melati. Setiap foto adalah cerita kebersamaan.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-5 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari judul, deskripsi, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2.5 text-sm"
              aria-label="Cari galeri"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 py-2.5 text-sm">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories
                .filter((cat) => cat !== "all")
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Info & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <p className="text-gray-700 font-medium">
            Menampilkan <span className="font-bold">{filteredItems.length}</span> dari{" "}
            <span className="text-gray-500">
              {galleryItems.filter((i) => i.status === "published").length}
            </span>{" "}
            foto
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600 hover:bg-blue-50">
              Reset Filter
            </Button>
          )}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <Card className="max-w-md mx-auto p-8 bg-white">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || selectedCategory !== "all"
                  ? "Tidak ada hasil ditemukan"
                  : "Belum ada foto"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Coba ubah kata kunci atau kategori pencarian Anda."
                  : "Galeri akan segera diisi dengan momen terbaru."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button onClick={resetFilters} variant="outline">
                  Tampilkan Semua
                </Button>
              )}
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <GalleryCard key={String(item.id)} item={item} />
            ))}
          </div>
        )}

        {/* Video Section */}
        <section className="mt-12 py-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Galeri Vidio</h2>
            <Button>
              <Link href="www.youtube.com" target="_blank" rel="noopener noreferrer">
                Lihat Semua di Youtube
              </Link>
            </Button>
          </div>
          {staticVideos.length === 0 ? (
            <Card className="max-w-md mx-auto p-8 bg-white text-center">
              <PlayCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-l font-semibold text-gray-900 mb-2">Belum ada Vidio</h3>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staticVideos.map((video) => (
                <VideoCard key={video.id} item={video}/>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}