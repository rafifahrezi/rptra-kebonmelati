"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, X, ArrowLeft, Loader2, AlertCircle, Check, Upload, Calendar } from "lucide-react";
import AdminLoading from "@/app/admin/loading";

// ==================================================
// Interfaces & Constants
// ==================================================
/**
 * Interface untuk data galeri (sinkron dengan backend model).
 * images: array ID GridFS (string ObjectId).
 * date: string dalam format YYYY-MM-DD untuk input date.
 */
interface Gallery {
  _id?: string;
  title: string;
  description?: string;
  category?: string;
  date: string;
  images: string[]; // Array ID GridFS
  status: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  "Berita Umum",
  "Program Anak",
  "Kegiatan Komunitas",
  "Kesehatan",
  "Pendidikan",
  "Event",
  "Pengumuman",
] as const;

type GalleryStatus = "draft" | "published" | "archived";
type SnackbarType = "success" | "error" | "info";

// ==================================================
// API Functions
// ==================================================
/**
 * Fetch semua galeri dari /api/gallery (GET).
 * @returns Array Gallery dari backend.
 * @throws Error jika fetch gagal.
 */
const fetchGalleries = async (): Promise<Gallery[]> => {
  const response = await fetch("/api/gallery");
  if (!response.ok) {
    throw new Error(`Gagal memuat galeri: ${response.status}`);
  }
  return response.json();
};

// ==================================================
// Utility Functions
// ==================================================
/**
 * Generate URL preview untuk image dari GridFS ID.
 * Asumsi endpoint /api/files/[id] untuk stream file dari GridFS.
 * @param id - GridFS file ID (string).
 * @returns URL untuk preview (atau placeholder jika ID kosong).
 */
const getImageUrl = (id: string): string => {
  if (!id || id.length === 0) {
    return "/placeholder-image.jpg"; // Fallback placeholder
  }
  return `/api/files/${id}`; // Endpoint untuk serve file dari GridFS
};

/**
 * Format date string untuk input date (YYYY-MM-DD).
 * Handle ISO string dari backend (e.g., "2025-01-15T00:00:00.000Z") atau Date object.
 * @param dateString - Date string dari backend (ISO atau YYYY-MM-DD).
 * @returns Formatted YYYY-MM-DD atau empty string jika invalid.
 */
const formatDateForInput = (dateString: string | Date | undefined): string => {
  if (!dateString) return "";

  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Format date untuk display (opsional, e.g., "15 Januari 2025").
 * @param dateString - Date string.
 * @returns Formatted date string untuk tampilan.
 */
const formatDateForDisplay = (dateString: string | Date | undefined): string => {
  if (!dateString) return "-";

  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// ==================================================
// Modal Delete
// ==================================================
/**
 * Modal konfirmasi hapus galeri.
 */
const ConfirmDeleteModal: React.FC<{
  gallery: Gallery | null;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}> = ({ gallery, onCancel, onConfirm, deleting }) => {
  if (!gallery) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
        <h2 id="delete-title" className="text-lg font-semibold text-gray-900 mb-2">
          Hapus Galeri?
        </h2>
        <p className="text-gray-600 mb-6">
          Apakah kamu yakin ingin menghapus{" "}
          <span className="font-medium text-red-600">{gallery.title}</span>?{" "}
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
            disabled={deleting}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            aria-label="Konfirmasi hapus galeri"
            className={`px-4 py-2 rounded-lg text-white ${deleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
              } transition flex items-center gap-2`}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================================================
// Gallery Form Component
// ==================================================
/**
 * Form untuk tambah/edit galeri.
 * images: array ID GridFS, preview via getImageUrl.
 * Date: Handle formatting untuk input type="date".
 */
interface GalleryFormProps {
  gallery: Gallery;
  setGallery: (updates: Partial<Gallery>) => void;
  images: string[]; // Array ID GridFS
  setImages: (images: string[]) => void;
  uploadingImage: boolean;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isEditing: boolean;
}

const GalleryForm: React.FC<GalleryFormProps> = ({
  gallery,
  setGallery,
  images,
  setImages,
  uploadingImage,
  handleImageUpload,
  onSave,
  onCancel,
  saving,
  isEditing,
}) => {
  const [titleCount, setTitleCount] = useState(gallery.title.length);
  const [descCount, setDescCount] = useState(gallery.description?.length || 0);

  // Format date untuk input (pastikan YYYY-MM-DD)
  const formattedDate = formatDateForInput(gallery.date);

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] shadow-2xl animate-fadeIn">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white flex justify-between items-center">
          <div>
            <h2 id="form-title" className="text-2xl font-semibold">
              {isEditing ? "Edit Galeri" : "Tambah Galeri Baru"}
            </h2>
            <p className="text-blue-100 text-sm">Isi detail galeri dengan lengkap</p>
          </div>
          <button
            onClick={onCancel}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Tutup form galeri"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Form */}
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          {/* Judul */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Judul *
            </label>
            <input
              id="title"
              type="text"
              value={gallery.title}
              onChange={(e) => {
                setGallery({ title: e.target.value });
                setTitleCount(e.target.value.length);
              }}
              required
              minLength={5}
              maxLength={100}
              placeholder="Masukkan judul galeri (min. 5 karakter)"
              aria-required="true"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className={`text-xs mt-1 ${titleCount > 100 ? "text-red-500" : "text-gray-500"}`} aria-live="polite">
              {titleCount}/100 karakter
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={gallery.description || ""}
              onChange={(e) => {
                setGallery({ description: e.target.value });
                setDescCount(e.target.value.length);
              }}
              placeholder="Tuliskan deskripsi singkat (opsional, max 500 karakter)"
              maxLength={500} // Range wajar untuk galeri: caption ringkas (3-4 kalimat)
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              rows={4}
              aria-describedby="desc-counter" // Accessibility: hubungkan ke counter
            />
            <p
              id="desc-counter"
              className={`text-xs mt-1 transition-colors ${descCount > 450
                ? "text-red-500" // Red jika mendekati max (peringatan)
                : descCount > 400
                  ? "text-orange-500" // Orange jika 80% limit (hint)
                  : "text-gray-500" // Gray jika aman
                }`}
              aria-live="polite" // Screen reader announce perubahan count
            >
              {descCount}/500 karakter
            </p>
          </div>


          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={gallery.category || ""}
              onChange={(e) => setGallery({ category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
              aria-required="true"
            >
              <option value="">Pilih kategori</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal (Fixed: Format YYYY-MM-DD untuk input) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formattedDate}
              onChange={(e) => setGallery({ date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
              aria-required="true"
              aria-describedby="date-help"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={gallery.status}
              onChange={(e) => setGallery({ status: e.target.value as GalleryStatus })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
              aria-required="true"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Upload Image (GridFS ID) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar (max 48MB/file)
            </label>
            <div className="flex flex-wrap gap-3">
              {images.map((imgId, idx) => (
                <div key={imgId || idx} className="relative w-24 h-24">
                  <img
                    src={getImageUrl(imgId)}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; // Fallback
                    }}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    aria-label="Hapus gambar"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition">
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                  aria-label="Upload gambar"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Upload gambar untuk galeri.</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 shadow"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================================================
// Snackbar Component
// ==================================================
/**
 * Komponen notifikasi snackbar sederhana.
 */
const Snackbar: React.FC<{
  message: string;
  onClose: () => void;
  type?: SnackbarType;
}> = ({ message, onClose, type = "info" }) => {
  const base = "fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-lg animate-fadeIn flex items-center gap-2";
  const color =
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white";

  return (
    <div className={`${base} ${color}`} role="alert">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ==================================================
// Main Component: GalleryManagementPage
// ==================================================
/**
 * Halaman utama manajemen galeri.
 * Sinkron dengan GridFS: images sebagai array ID, preview via /api/files/[id].
 * Date handling: Format YYYY-MM-DD untuk edit modal.
 */
const GalleryManagementPage: React.FC = () => {
  // State untuk list galeri
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [galleryForm, setGalleryForm] = useState<Gallery>({
    title: "",
    description: "",
    category: "",
    date: "",
    status: "draft",
    images: [],
  });
  const [images, setImages] = useState<string[]>([]); // Array ID GridFS
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // State untuk snackbar dan delete modal
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type?: SnackbarType;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load galleries
  const loadGalleries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGalleries();
      // Format date untuk konsistensi (opsional, jika backend kirim ISO string)
      const formattedData = data.map((gallery: Gallery) => ({
        ...gallery,
        date: formatDateForInput(gallery.date), // Pastikan date dalam YYYY-MM-DD
      }));
      setGalleries(formattedData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat galeri";
      setError(msg);
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  // Update form gallery
  const updateGallery = useCallback((updates: Partial<Gallery>) => {
    setGalleryForm((prev) => ({ ...prev, ...updates }));
  }, []);

  // Open modal (tambah/edit) - Pastikan date diformat saat edit
  const openModal = useCallback((gallery?: Gallery) => {
    if (gallery) {
      // Format date untuk input saat edit
      const formattedGallery = {
        ...gallery,
        date: formatDateForInput(gallery.date),
      };
      setGalleryForm(formattedGallery);
      setImages(gallery.images || []);
      setEditingGallery(formattedGallery);
    } else {
      setGalleryForm({
        title: "",
        description: "",
        category: "",
        date: "", // Kosong untuk tambah baru
        status: "draft",
        images: [],
      });
      setImages([]);
      setEditingGallery(null);
    }
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setGalleryForm({
      title: "",
      description: "",
      category: "",
      date: "",
      status: "draft",
      images: [],
    });
    setImages([]);
    setEditingGallery(null);
  }, []);

  // Save gallery (POST/PUT) - Date sudah dalam YYYY-MM-DD
  const handleSave = useCallback(async () => {
    if (!galleryForm.title.trim() || !galleryForm.date || !galleryForm.category) {
      setSnackbar({
        message: "Judul, tanggal, dan kategori wajib diisi!",
        type: "error",
      });
      return;
    }

    // Validasi date (pastikan valid)
    const dateObj = new Date(galleryForm.date);
    if (isNaN(dateObj.getTime())) {
      setSnackbar({
        message: "Tanggal tidak valid!",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      // Payload: images sebagai array ID GridFS, date sebagai string YYYY-MM-DD (backend convert ke Date)
      const payload = { ...galleryForm, images };
      const url = editingGallery?._id ? `/api/gallery/${editingGallery._id}` : "/api/gallery";
      const method = editingGallery?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal menyimpan galeri");
      }

      await loadGalleries();
      setSnackbar({
        message: editingGallery ? "Galeri berhasil diperbarui!" : "Galeri berhasil dibuat!",
        type: "success",
      });
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan galeri";
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  }, [galleryForm, images, editingGallery, loadGalleries, closeModal]);

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/gallery/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await res.text() || "Gagal menghapus galeri");
      }
      setSnackbar({ message: "Galeri berhasil dihapus!", type: "success" });
      await loadGalleries();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal hapus galeri";
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadGalleries]);

  // Upload Image (GridFS: simpan fileId, preview via getImageUrl)
  const handleImageUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_SIZE = 48 * 1024 * 1024; // 48MB in bytes

    // Early validation untuk filter file invalid
    const validFiles = Array.from(files).filter((file) => {
      const isValid = file.size <= MAX_SIZE && file.type.startsWith("image/");
      if (!isValid) {
        const reason = file.size > MAX_SIZE ? "melebihi 48MB" : "bukan file gambar";
        setSnackbar({
          message: `❌ ${file.name}: ${reason}`,
          type: "error",
        });
      }
      return isValid;
    });

    if (validFiles.length === 0) {
      setSnackbar({
        message: "❌ Tidak ada file gambar yang valid untuk diupload",
        type: "error",
      });
      return;
    }

    setUploadingImage(true);

    try {
      // Parallel upload ke /api/upload (return fileId dari GridFS)
      const uploadPromises = validFiles.map(async (file) => {
        if (file.size > MAX_SIZE) {
          throw new Error(`File ${file.name} terlalu besar (maksimal 48MB)`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errData.error || `Gagal mengupload ${file.name}`);
        }

        const data = await res.json();
        if (!data.fileId || typeof data.fileId !== "string" || data.fileId.length === 0) {
          throw new Error(`ID file tidak ditemukan untuk ${file.name}`);
        }

        return data.fileId;
      });

      const uploadedIds = await Promise.all(uploadPromises);

      // Update state images dengan array ID GridFS (tanpa base64 preview)
      setImages((prev) => [...prev, ...uploadedIds]);

      setSnackbar({
        message: `✅ ${uploadedIds.length} gambar berhasil diupload!`,
        type: "success",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengupload gambar";
      setSnackbar({
        message: `❌ ${errorMessage}`,
        type: "error",
      });
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = ""; // Reset input
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-10 border-gray-200 sticky top-0 z-30">
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
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Galeri</h1>
                <p className="text-gray-600 mt-1">Kelola Galeri dan Photo RPTRA</p>
              </div>
            </div>
            <div className="flex flex-2 gap-2 justify-end">
            <Link href="/admin/video" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium">
              Tambah Vidio
            </Link>
            <button
              onClick={() => openModal()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium"
              disabled={saving || uploadingImage}
            >
              <Plus className="w-5 h-5" />
              Buat Galeri
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* List Galleries */}
      <main>
        {loading ? (
          <AdminLoading message="Memuat galeri..." fullScreen />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex gap-2 items-center">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada galeri tersedia.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((g) => (
              <article
                key={g._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                aria-labelledby={`gallery-${g._id}-title`}
              >
                {g.images?.[0] ? (
                  <img
                    src={getImageUrl(g.images[0])}
                    alt={g.title}
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-50 flex items-center justify-center text-gray-400">
                    <span>Tidak ada gambar</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 id={`gallery-${g._id}-title`} className="font-semibold text-lg mb-2">
                    {g.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                    {g.description || "Tanpa deskripsi"}
                  </p>
                  {/* Tampilkan tanggal di card (opsional) */}
                  {g.date && (
                    <div className=" flex-shrink-0">
                      <Calendar className="w-4 h-4 mr-2" />
                      <p className="text-xs text-gray-500 mb-4">
                        {formatDateForDisplay(g.date)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {g.category || "Tanpa kategori"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${g.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : g.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-800"
                        }`}
                      aria-label={`Status: ${g.status}`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => openModal(g)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                      aria-label={`Edit ${g.title}`}
                      disabled={saving || uploadingImage}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(g)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 transition"
                      aria-label={`Hapus ${g.title}`}
                      disabled={deleting}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {isModalOpen && (
        <GalleryForm
          gallery={galleryForm}
          setGallery={updateGallery}
          images={images}
          setImages={setImages}
          uploadingImage={uploadingImage}
          handleImageUpload={handleImageUpload}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
          isEditing={!!editingGallery}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          gallery={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
};

export default GalleryManagementPage;
