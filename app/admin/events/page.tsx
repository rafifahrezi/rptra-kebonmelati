"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import Link from "next/link";
import AdminLoading from "@/app/admin/loading";


type EventStatus = "upcoming" | "ongoing" | "finished";

interface EventDoc {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  location: string;
  status: EventStatus;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

const categories = [
  "Kuliner",
  "Seni", 
  "Olahraga",
  "Edukasi",
  "Budaya",
  "Teknologi",
  "Kesehatan",
] as const;

const statuses: { value: EventStatus; label: string }[] = [
  { value: "upcoming", label: "Akan Datang" },
  { value: "ongoing", label: "Sedang Berlangsung" },
  { value: "finished", label: "Selesai" },
];

const emptyForm: Omit<EventDoc, "id" | "_id"> = {
  title: "",
  description: "",
  category: "",
  date: "",
  location: "",
  status: "upcoming",
  images: [],
};

const getStatusStyle = (status: EventStatus): string => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ongoing":
      return "bg-green-100 text-green-800 border-green-200";
    case "finished":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Enhanced Image Gallery Component
const ImageGallery: React.FC<{
  images: string[];
  title: string;
  onImageError?: (index: number) => void;
}> = ({ images, title, onImageError }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    onImageError?.(index);
  };

  const goToNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Upload className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Tidak ada gambar</p>
        </div>
      </div>
    );
  }

  const validImages = images.filter((_, index) => !imageErrors[index]);

  if (validImages.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <X className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Gambar tidak dapat dimuat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative w-full h-48 sm:h-64 md:h-72 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={validImages[currentImageIndex]}
          alt={`${title} - Gambar ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onError={() => handleImageError(currentImageIndex)}
          loading="lazy"
        />
        
        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Gambar selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentImageIndex
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Event Card with Better Image Display
const EventCard: React.FC<{
  event: EventDoc;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ event, onView, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const statusLabel = statuses.find((s) => s.value === event.status)?.label ?? "";
  const images = Array.isArray(event.images) ? event.images : [];

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full h-48 bg-gray-100">
        {images.length > 0 && !imageError ? (
          <>
            <img
              src={images[0]}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(event.status)}`}>
                {statusLabel}
              </span>
            </div>

            {/* Image Count Badge */}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                +{images.length - 1} foto
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Tidak ada gambar</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
              {event.category}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{new Date(event.date).toLocaleDateString("id-ID", {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Description Preview */}
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {event.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-3 flex items-center justify-center gap-1 text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Lihat
          </button>
          <button
            onClick={onEdit}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2 px-3 flex items-center justify-center gap-1 text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-3 flex items-center justify-center gap-1 text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Modal Component with Full Image Gallery
const EventModal: React.FC<{
  mode: "create" | "edit" | "view";
  event: EventDoc | null;
  form: Omit<EventDoc, "id" | "_id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<EventDoc, "id" | "_id">>>;
  onClose: () => void;
  onSubmit: () => void;
  error: string | null;
  isSubmitting: boolean;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
}> = ({
  mode,
  event,
  form,
  setForm,
  onClose,
  onSubmit,
  error,
  isSubmitting,
  uploadingImage,
  onImageUpload,
  onImageRemove,
}) => {
  const handleImageError = (index: number) => {
    // Handle image error in gallery
    console.warn(`Image at index ${index} failed to load`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {mode === "create"
                ? "Buat Event Baru"
                : mode === "edit"
                ? "Edit Event"
                : "Detail Event"}
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label="Tutup modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === "view" && event ? (
            /* VIEW MODE */
            <div className="space-y-6">
              {/* Image Gallery */}
              <ImageGallery
                images={event.images}
                title={event.title}
                onImageError={handleImageError}
              />

              {/* Event Info */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(event.status)}`}>
                    {statuses.find((s) => s.value === event.status)?.label}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>

                <h3 className="text-3xl font-bold text-gray-900">{event.title}</h3>

                {event.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal & Waktu</p>
                      <p className="font-medium text-gray-900">
                        {new Date(event.date).toLocaleDateString("id-ID", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-900">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CREATE/EDIT MODE */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="space-y-6"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Masukkan judul event..."
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="RPTRA Kebon Melati"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as EventStatus }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    required
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-y"
                  placeholder="Deskripsikan event Anda..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, category }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.category === category
                          ? "bg-emerald-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Gambar
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <button
                      type="button"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      disabled={uploadingImage}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        uploadingImage
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {uploadingImage ? "Mengupload..." : "Pilih Gambar"}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Format: JPG, PNG | Maksimal 5MB per file
                    </p>
                  </div>

                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>

                {/* Image Preview */}
                {form.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Gambar Terpilih ({form.images.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {form.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => onImageRemove(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg text-white font-medium transition-all flex items-center gap-2 ${
                    isSubmitting
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {mode === "create" ? "Buat Event" : "Perbarui Event"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventDoc | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [selected, setSelected] = useState<EventDoc | null>(null);
  const [form, setForm] = useState<Omit<EventDoc, "id" | "_id">>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events", { credentials: 'include' });
      if (!res.ok) throw new Error("Gagal mengambil data events");
      
      const data: EventDoc[] = await res.json();
      const sanitizedEvents = data.map(event => ({
        ...event,
        images: Array.isArray(event.images) ? event.images : []
      }));
      
      setEvents(sanitizedEvents);
      setError(null);
    } catch (err) {
      console.error("Fetch events error:", err);
      setError("Gagal memuat data events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = !search.trim() || 
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === "all" || event.category === filterCategory;
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Modal handlers
  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    setSelected(null);
    setShowModal(true);
    setError(null);
  };

  const openEdit = (event: EventDoc) => {
    setMode("edit");
    setSelected(event);
    const { _id, id, ...rest } = event;
    setForm({
      ...emptyForm,
      ...rest,
      images: Array.isArray(rest.images) ? rest.images : []
    });
    setShowModal(true);
    setError(null);
  };

  const openView = (event: EventDoc) => {
    setMode("view");
    setSelected({
      ...event,
      images: Array.isArray(event.images) ? event.images : []
    });
    setShowModal(true);
    setError(null);
  };

  // Form validation
  const validateForm = (): string | null => {
    if (!form.title?.trim()) return "Judul wajib diisi";
    if (!form.category) return "Kategori wajib dipilih";
    if (!form.date) return "Tanggal wajib diisi";
    if (!form.location?.trim()) return "Lokasi wajib diisi";
    if (!form.status) return "Status wajib dipilih";
    return null;
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;
  setError(null);
  setUploadingImage(true);
  try {
    const uploadedUrls: string[] = [];
    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} terlalu besar (maksimal 5MB)`);
      }
      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      // Upload to /api/upload
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal mengupload gambar");
      }
      const data = await res.json();
      if (!data.url) throw new Error("URL gambar tidak ditemukan dari server");
      uploadedUrls.push(data.url);
    }
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Gagal mengupload gambar");
  } finally {
    setUploadingImage(false);
    if (e.target) e.target.value = ""; // Reset input
  }
};


  const handleImageRemove = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const eventData = {
        ...form,
        title: form.title.trim(),
        location: form.location.trim(),
        description: form.description?.trim() || "",
        images: form.images
      };

      let response: Response;
      
      if (mode === "create") {
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(eventData)
        });
      } else if (mode === "edit" && selected?._id) {
        response = await fetch(`/api/events/${selected._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(eventData)
        });
      } else {
        throw new Error("Mode atau ID tidak valid");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan event");
      }

      await fetchEvents();
      setShowModal(false);
      setForm(emptyForm);
      setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const confirmDelete = (event: EventDoc) => {
    setDeleteTarget(event);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      const response = await fetch(`/api/events/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus event");
      }

      await fetchEvents();
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      setError("Gagal menghapus event");
    }
  };

  // Calculate summary
  const totalEvents = events.length;
  const activeEvents = events.filter(event => event.status === "ongoing").length;
  const upcomingEvents = events.filter(event => event.status === "upcoming").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Event</h1>
                <p className="text-gray-600 mt-1">Kelola kegiatan dan acara RPTRA</p>
              </div>
            </div>
            
            <button
              onClick={openCreate}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Buat Event
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Event</p>
                <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Event Aktif</p>
                <p className="text-3xl font-bold text-green-600">{activeEvents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Akan Datang</p>
                <p className="text-3xl font-bold text-amber-600">{upcomingEvents}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Cari event berdasarkan judul, deskripsi, lokasi..."
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-w-[150px]"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-w-[150px]"
              >
                <option value="all">Semua Status</option>
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <AdminLoading message="Memverifikasi akses admin..." fullScreen />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search || filterCategory !== "all" || filterStatus !== "all" 
                ? "Tidak ada event yang sesuai"
                : "Belum ada event"
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {search || filterCategory !== "all" || filterStatus !== "all"
                ? "Coba ubah filter pencarian Anda"
                : "Mulai dengan membuat event pertama Anda"
              }
            </p>
            {!search && filterCategory === "all" && filterStatus === "all" && (
              <button
                onClick={openCreate}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Buat Event Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id || event.id || `${event.title}-${event.date}`}
                event={event}
                onView={() => openView(event)}
                onEdit={() => openEdit(event)}
                onDelete={() => confirmDelete(event)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          mode={mode}
          event={selected}
          form={form}
          setForm={setForm}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          error={error}
          isSubmitting={isSubmitting}
          uploadingImage={uploadingImage}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hapus Event
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus event "<strong>{deleteTarget.title}</strong>"? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;