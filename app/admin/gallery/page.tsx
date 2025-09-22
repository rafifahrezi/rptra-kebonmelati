"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Upload,
} from "lucide-react";
import AdminLoading from "@/app/admin/loading";


// ==================================================
// Interfaces & Const
// ==================================================
interface Gallery {
  _id?: string;
  title: string;
  description?: string;
  category?: string;
  date: string;
  images: string[];
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

// ==================================================
// API
// ==================================================
const fetchGalleries = async (): Promise<Gallery[]> => {
  const response = await fetch("/api/gallery");
  if (!response.ok) throw new Error(`Gagal memuat galeri: ${response.status}`);
  return response.json();
};

// ==================================================
// Modal Delete
// ==================================================
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
        <h2
          id="delete-title"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
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
// Gallery Form
// ==================================================
interface GalleryFormProps {
  gallery: Gallery;
  setGallery: (updates: Partial<Gallery>) => void;
  imagesPreview: string[];
  setImagesPreview: (images: string[]) => void;
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
  imagesPreview,
  setImagesPreview,
  uploadingImage,
  handleImageUpload,
  onSave,
  onCancel,
  saving,
  isEditing,
}) => {
  const [titleCount, setTitleCount] = useState(gallery.title.length);
  const [descCount, setDescCount] = useState(gallery.description?.length || 0);

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
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
            <p
              className={`text-xs mt-1 ${titleCount > 100 ? "text-red-500" : "text-gray-500"
                }`}
              aria-live="polite"
            >
              {titleCount}/100 karakter
            </p>
          </div>

          {/* Deskripsi */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Deskripsi
            </label>
            <textarea
              id="description"
              value={gallery.description || ""}
              onChange={(e) => {
                setGallery({ description: e.target.value });
                setDescCount(e.target.value.length);
              }}
              placeholder="Tuliskan deskripsi (opsional, max 500 karakter)"
              maxLength={500}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              rows={4}
            />
            <p
              className={`text-xs mt-1 ${descCount > 500 ? "text-red-500" : "text-gray-500"
                }`}
              aria-live="polite"
            >
              {descCount}/500 karakter
            </p>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={gallery.date}
              onChange={(e) => setGallery({ date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
              aria-required="true"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={gallery.status}
              onChange={(e) => setGallery({ status: e.target.value as Gallery["status"] })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
              aria-required="true"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Upload Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar (max 10MB/file)
            </label>
            <div className="flex flex-wrap gap-3">
              {imagesPreview.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    aria-label="Hapus gambar"
                    onClick={() =>
                      setImagesPreview(imagesPreview.filter((_, i) => i !== idx))
                    }
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
                  aria-label="Upload gambar"
                />
              </label>
            </div>
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
// Snackbar
// ==================================================
// ==================================================
// Snackbar (simple & friendly)
// ==================================================
const Snackbar: React.FC<{
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info";
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
// Main Page
// ==================================================
const GalleryManagementPage: React.FC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGalleries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGalleries();
      setGalleries(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  const updateGallery = useCallback((updates: Partial<Gallery>) => {
    setGalleryForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const openModal = useCallback((gallery?: Gallery) => {
    if (gallery) {
      setGalleryForm(gallery);
      setImagesPreview(gallery.images || []);
      setEditingGallery(gallery);
    } else {
      setGalleryForm({
        title: "",
        description: "",
        category: "",
        date: "",
        status: "draft",
        images: [],
      });
      setImagesPreview([]);
      setEditingGallery(null);
    }
    setIsModalOpen(true);
  }, []);

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
    setImagesPreview([]);
    setEditingGallery(null);
  }, []);

  // Save
  const handleSave = useCallback(async () => {
    if (!galleryForm.title.trim() || !galleryForm.date || !galleryForm.category) {
      setSnackbar({
        message: "Judul, tanggal, dan kategori wajib diisi!",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = { ...galleryForm, images: imagesPreview };
      const url = editingGallery?._id
        ? `/api/gallery/${editingGallery._id}`
        : "/api/gallery";
      const method = editingGallery?._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadGalleries();
      setSnackbar({
        message: editingGallery ? "Galeri berhasil diperbarui!" : "Galeri berhasil dibuat!",
        type: "success",
      });
      closeModal();
    } catch (err) {
      setSnackbar({ message: (err as Error).message, type: "error" });
    } finally {
      setSaving(false);
    }
  }, [galleryForm, imagesPreview, editingGallery, loadGalleries, closeModal]);

  // Delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);

    try {
      await fetch(`/api/gallery/${deleteTarget._id}`, { method: "DELETE" });
      setSnackbar({ message: "Galeri berhasil dihapus!", type: "success" });
      await loadGalleries();
    } catch (err) {
      setSnackbar({
        message: (err as Error).message || "Gagal hapus galeri",
        type: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadGalleries]);

  // Upload Image
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_SIZE = 48 * 1024 * 1024; // 48MB in bytes

    // Early validation to optimize performance
    const validFiles = Array.from(files).filter((file) => {
      const isValid = file.size <= MAX_SIZE;
      if (!isValid) {
        setSnackbar({
          message: `❌ ${file.name} melebihi 48MB`,
          type: "error",
        });
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setUploadingImage(true);

    try {
      // Use Promise.all for parallel uploads
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        // Check response status and parse accordingly
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || `Gagal upload ${file.name}`);
        }

        const data = await res.json();
        if (!data.url) {
          throw new Error(`Respon tidak valid untuk ${file.name}: URL tidak ditemukan`);
        }

        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setImagesPreview((prev) => [...prev, ...uploadedUrls]);
      setSnackbar({
        message: `✅ ${uploadedUrls.length} gambar berhasil diupload!`,
        type: "success",
      });
    } catch (err) {
      setSnackbar({
        message: (err as Error).message || "Gagal upload gambar",
        type: "error",
      });
    } finally {
      setUploadingImage(false);
      e.target.value = ""; // Reset input to allow re-uploading the same file
    }
  };



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

            <button
              onClick={() => openModal()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" /> Tambah
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <main>
        {loading ? (
            <AdminLoading message="Memuat Gambar..." fullScreen />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex gap-2 items-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        ) : galleries.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Tidak ada galeri</p>
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
                    src={g.images[0]}
                    alt={g.title}
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-50 flex items-center justify-center text-gray-400">
                    <span>Tidak ada gambar</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 id={`gallery-${g._id}-title`} className="font-semibold text-lg">
                    {g.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                    {g.description || "Tanpa deskripsi"}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
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
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                      aria-label={`Edit ${g.title}`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(g)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Hapus ${g.title}`}
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
          imagesPreview={imagesPreview}
          setImagesPreview={setImagesPreview}
          uploadingImage={uploadingImage}
          handleImageUpload={(e) => {
            // reuse handler defined above
            handleImageUpload(e);
          }}
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
