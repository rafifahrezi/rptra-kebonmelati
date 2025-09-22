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
  import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
  import { 
    Search, 
    Calendar, 
    ImageIcon, 
    AlertCircle, 
    RefreshCw,
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    Download
  } from "lucide-react";

  interface GalleryItem {
    id: number | string;
    title: string;
    description: string;
    images: string[];
    category: string;
    date: string;
    status: "draft" | "published" | "archived";
  }

  // Enhanced Image Component with Error Handling
  const GalleryImage: React.FC<{
    src: string;
    alt: string;
    title: string;
    className?: string;
    onError?: () => void;
    onLoad?: () => void;
    loading?: "lazy" | "eager";
  }> = ({ src, alt, title, className, onError, onLoad, loading = "lazy" }) => {
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
            <p className="text-sm text-gray-500">Gambar tidak dapat dimuat</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          title={title}
          className="w-full h-full object-cover"
          onError={handleError}
          onLoad={handleLoad}
          loading={loading}
        />
      </div>
    );
  };

  // Enhanced Gallery Card Component
  const GalleryCard: React.FC<{
    item: GalleryItem;
    onClick: () => void;
  }> = ({ item, onClick }) => {
    const primaryImage = item.images?.[0];
    const hasMultipleImages = item.images?.length > 1;

    return (
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Buka galeri ${item.title}`}
      >
        <div className="aspect-square relative">
          {primaryImage ? (
            <GalleryImage
              src={primaryImage}
              alt={item.title}
              title={item.title}
              className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-900 shadow-sm">
              {item.category}
            </Badge>
            {item.status !== 'published' && (
              <Badge 
                variant={item.status === 'draft' ? 'default' : 'secondary'} 
                className="capitalize shadow-sm"
              >
                {item.status}
              </Badge>
            )}
            {hasMultipleImages && (
              <Badge variant="secondary" className="bg-blue-500 text-white shadow-sm">
                +{item.images.length - 1} foto
              </Badge>
            )}
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
              {item.title}
            </h3>
            <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // Enhanced Modal Component with Image Gallery
  const GalleryModal: React.FC<{
    item: GalleryItem;
    isOpen: boolean;
    onClose: () => void;
  }> = ({ item, isOpen, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const currentImage = item.images?.[currentImageIndex];
    const hasMultipleImages = item.images?.length > 1;

    const goToNext = useCallback(() => {
      if (hasMultipleImages) {
        setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
      }
    }, [hasMultipleImages, item.images?.length]);

    const goToPrev = useCallback(() => {
      if (hasMultipleImages) {
        setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
      }
    }, [hasMultipleImages, item.images?.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    }, [isOpen, onClose, goToPrev, goToNext]);

    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const downloadImage = useCallback(() => {
      if (!currentImage) return;

      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `${item.title}-${currentImageIndex + 1}`;
      link.click();
    }, [currentImage, item.title, currentImageIndex]);

    if (!isOpen) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">{item.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Galeri foto {item.title} dari kategori {item.category}
          </DialogDescription>
          
          <div className="relative bg-black">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 z-20 bg-black/50 text-white hover:bg-black/70"
              onClick={onClose}
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Navigation Buttons */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white hover:bg-black/70"
                  onClick={goToPrev}
                  aria-label="Gambar sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white hover:bg-black/70"
                  onClick={goToNext}
                  aria-label="Gambar selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={() => setIsZoomed(!isZoomed)}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={downloadImage}
                aria-label="Download gambar"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {item.images.length}
              </div>
            )}

            {/* Main Image */}
            <div className={`relative ${isZoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={item.title}
                  className={`w-full max-h-[80vh] object-contain transition-transform duration-300 ${
                    isZoomed ? 'scale-150 cursor-move' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <div className="flex gap-2 bg-black/50 p-2 rounded-lg max-w-xs overflow-x-auto">
                  {item.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-white'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      aria-label={`Lihat gambar ${index + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="p-6 space-y-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{item.category}</Badge>
                  {item.status !== 'published' && (
                    <Badge variant="secondary" className="capitalize">
                      {item.status}
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
                {item.description && (
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.date).toLocaleDateString("id-ID", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {hasMultipleImages && (
                <span>{item.images.length} foto dalam galeri ini</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  export default function GalleryPage() {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch gallery data with enhanced error handling
    const fetchGallery = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch("/api/gallery", {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Gagal mengambil data galeri`);
        }
        
        const data: any[] = await res.json();

        // Ensure images field is always an array and add id
        const sanitizedData = data.map(item => ({
          ...item,
          id: item._id,
          images: Array.isArray(item.images) ? item.images : []
        }));
        
        setGalleryItems(sanitizedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui";
        setError(errorMessage);
        console.error('Gallery fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchGallery();
    }, [fetchGallery]);

    // Memoized categories
    const categories = useMemo(() => [
      "all",
      ...Array.from(new Set(galleryItems.map((item) => item.category.toLowerCase()))),
    ], [galleryItems]);

    // Memoized filtered items
    const filteredItems = useMemo(() => {
      return galleryItems.filter((item) => {
        const matchesCategory =
          selectedCategory === "all" || 
          item.category.toLowerCase() === selectedCategory;
        
        const matchesSearch =
          searchTerm === "" ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesSearch && item.status === 'published';
      });
    }, [galleryItems, selectedCategory, searchTerm]);

    // Modal handlers
    const openModal = useCallback((item: GalleryItem) => {
      setSelectedItem(item);
      setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
      setIsModalOpen(false);
      setSelectedItem(null);
    }, []);

    // Reset filters
    const resetFilters = useCallback(() => {
      setSearchTerm("");
      setSelectedCategory("all");
    }, []);

    // Loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Memuat galeri foto...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Galeri</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={fetchGallery} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Muat Ulang
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="text-center space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Galeri <span className="text-blue-600">Foto</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Jelajahi momen-momen berharga dari berbagai kegiatan dan program yang telah kami selenggarakan di RPTRA Kebon Melati. 
              Setiap foto menceritakan kisah komunitas yang hidup dan berkembang bersama.
            </p>
          </header>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8" role="search" aria-label="Filter galeri">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
              <Input
                placeholder="Cari foto berdasarkan judul, deskripsi, atau kategori..."
                className="pl-10 pr-4 py-3 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Cari foto atau kegiatan"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              aria-label="Filter berdasarkan kategori"
            >
              <SelectTrigger className="w-full sm:w-48 py-3">
                <SelectValue placeholder="Pilih Kategori" />
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

          {/* Results Info */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? "Memuat..." : `Menampilkan ${filteredItems.length} foto`}
              {(searchTerm || selectedCategory !== "all") && (
                <span className="ml-1">
                  dari {galleryItems.filter(item => item.status === 'published').length} total foto
                </span>
              )}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filter
              </Button>
            )}
          </div>

          {/* Gallery Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-sm p-12 max-w-md mx-auto">
                <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Tidak Ada Foto yang Sesuai"
                    : "Belum Ada Foto"
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Coba ubah kata kunci pencarian atau filter kategori Anda"
                    : "Foto-foto galeri sedang dalam proses pengunggahan"
                  }
                </p>
                {(searchTerm || selectedCategory !== "all") && (
                  <Button onClick={resetFilters}>
                    Lihat Semua Foto
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                role="grid"
                aria-label="Galeri foto"
              >
                {filteredItems.map((item) => (
                  <GalleryCard
                    key={String(item.id)}
                    item={item}
                    onClick={() => openModal(item)}
                  />
                ))}
              </div>

              {/* Load more button could be added here for pagination */}
            </>
          )}
        </div>

        {/* Modal */}
        {selectedItem && (
          <GalleryModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
      </div>
    );
  }