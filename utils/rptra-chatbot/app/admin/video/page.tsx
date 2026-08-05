
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, X, ArrowLeft, Loader2, AlertCircle, Check, Calendar, PlayCircle } from "lucide-react";
import AdminLoading from "@/app/admin/loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// ==================================================
// Interfaces & Constants
// ==================================================
/**
 * Interface untuk data video (sinkron dengan backend model).
 * youtubeUrl: URL embed YouTube (e.g., https://www.youtube.com/embed/VIDEO_ID).
 * date: string dalam format YYYY-MM-DD.
 */
interface Video {
  _id?: string;
  titleVidio: string;
  deskripsi?: string;
  date: string;
  youtubeUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

type SnackbarType = "success" | "error" | "info";

// ==================================================
// API Functions
// ==================================================
/**
 * Fetch semua video dari /api/video (GET).
 * @returns Array Video dari backend.
 * @throws Error jika fetch gagal.
 */
const fetchVideos = async (): Promise<Video[]> => {
  const response = await fetch("/api/video", {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Gagal memuat video: ${response.status}`);
  }
  return response.json();
};

/**
 * Parse YouTube video ID dari URL.
 * Support formats: youtube.com/watch?v=ID, youtu.be/ID, embed/ID.
 * @param url - Full YouTube URL.
 * @returns Video ID atau null jika invalid.
 */
const parseYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Generate embed URL dari YouTube video ID.
 * @param videoId - YouTube video ID.
 * @returns Embed URL atau fallback jika invalid.
 */
const getEmbedUrl = (videoId: string): string => {
  if (!videoId || videoId.length !== 11) return "/placeholder-video.jpg";
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Format date string untuk input date (YYYY-MM-DD).
 * Handle ISO string dari backend.
 * @param dateString - Date string dari backend.
 * @returns Formatted YYYY-MM-DD atau empty string jika invalid.
 */
const formatDateForInput = (dateString: string | Date | undefined): string => {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd", { locale: id });
};

/**
 * Format date untuk display (e.g., "15 Januari 2025").
 * @param dateString - Date string.
 * @returns Formatted date string.
 */
const formatDateForDisplay = (dateString: string | Date | undefined): string => {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return format(date, "dd MMMM yyyy", { locale: id });
};

// ==================================================
// Modal Delete
// ==================================================
const ConfirmDeleteModal: React.FC<{
  video: Video | null;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}> = ({ video, onCancel, onConfirm, deleting }) => {
  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <Card className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
        <h2 id="delete-title" className="text-lg font-semibold text-gray-900 mb-2">
          Hapus Video?
        </h2>
        <p className="text-gray-600 mb-6">
          Apakah kamu yakin ingin menghapus{" "}
          <span className="font-medium text-red-600">{video.titleVidio}</span>?{" "}
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={deleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            aria-label="Konfirmasi hapus video"
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ==================================================
// Video Form Component
// ==================================================
interface VideoFormProps {
  video: Video;
  setVideo: (updates: Partial<Video>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isEditing: boolean;
}

const VideoForm: React.FC<VideoFormProps> = ({
  video,
  setVideo,
  onSave,
  onCancel,
  saving,
  isEditing,
}) => {
  const [titleCount, setTitleCount] = useState(video.titleVidio.length);
  const [descCount, setDescCount] = useState(video.deskripsi?.length || 0);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Format date untuk input (YYYY-MM-DD)
  const formattedDate = formatDateForInput(video.date);

  // Handle YouTube URL input and parse ID
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const videoId = parseYouTubeId(url);
    setVideo({ youtubeUrl: videoId ? getEmbedUrl(videoId) : url });
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <Card className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] shadow-2xl animate-fadeIn">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white flex justify-between items-center">
          <div>
            <h2 id="form-title" className="text-2xl font-semibold">
              {isEditing ? "Edit Video" : "Tambah Video Baru"}
            </h2>
            <p className="text-blue-100 text-sm">Isi detail video dengan lengkap</p>
          </div>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-white/70 hover:text-white"
            aria-label="Tutup form video"
          >
            <X className="w-6 h-6" />
          </Button>
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
            <label htmlFor="titleVidio" className="block text-sm font-medium text-gray-700 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <Input
              id="titleVidio"
              type="text"
              value={video.titleVidio}
              onChange={(e) => {
                setVideo({ titleVidio: e.target.value });
                setTitleCount(e.target.value.length);
              }}
              required
              minLength={5}
              maxLength={100}
              placeholder="Masukkan judul video (min. 5 karakter)"
              aria-required="true"
            />
            <p className={`text-xs mt-1 ${titleCount > 100 ? "text-red-500" : "text-gray-500"}`} aria-live="polite">
              {titleCount}/100 karakter
            </p>
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              id="deskripsi"
              value={video.deskripsi || ""}
              onChange={(e) => {
                setVideo({ deskripsi: e.target.value });
                setDescCount(e.target.value.length);
              }}
              placeholder="Tuliskan deskripsi singkat (opsional, max 500 karakter)"
              maxLength={500}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              rows={4}
              aria-describedby="desc-counter"
            />
            <p
              id="desc-counter"
              className={`text-xs mt-1 transition-colors ${descCount > 450 ? "text-red-500" : descCount > 400 ? "text-orange-500" : "text-gray-500"}`}
              aria-live="polite"
            >
              {descCount}/500 karakter
            </p>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                  aria-required="true"
                >
                  {formattedDate ? formatDateForDisplay(video.date) : "Pilih tanggal"}
                  <Calendar className="w-4 h-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={formattedDate ? new Date(formattedDate) : undefined}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      setVideo({ date: format(selectedDate, "yyyy-MM-dd", { locale: id }) });
                      setDatePopoverOpen(false);
                    }
                  }}
                  initialFocus
                  locale={id}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* YouTube URL */}
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL YouTube <span className="text-red-500">*</span>
            </label>
            <Input
              id="youtubeUrl"
              type="url"
              value={video.youtubeUrl}
              onChange={handleUrlChange}
              required
              placeholder="Masukkan URL YouTube (e.g., https://www.youtube.com/watch?v=VIDEO_ID)"
              aria-required="true"
            />
            <p className="text-xs text-gray-500 mt-1">URL akan diubah menjadi embed secara otomatis.</p>
            {video.youtubeUrl && parseYouTubeId(video.youtubeUrl) && (
              <div className="mt-2">
                <iframe
                  src={video.youtubeUrl}
                  title="Video Preview"
                  className="w-full h-40 rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// ==================================================
// Snackbar Component
// ==================================================
const Snackbar: React.FC<{
  message: string;
  onClose: () => void;
  type?: SnackbarType;
}> = ({ message, onClose, type = "info" }) => {
  const color =
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white";

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-lg animate-fadeIn flex items-center gap-2 ${color}`} role="alert">
      <span>{message}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

// ==================================================
// Main Component: VideoManagementPage
// ==================================================
const VideoManagementPage: React.FC = () => {
  // State untuk list video
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false); // Added saving state

  // State untuk modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoForm, setVideoForm] = useState<Video>({
    titleVidio: "",
    deskripsi: "",
    date: "",
    youtubeUrl: "",
  });

  // State untuk snackbar dan delete modal
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type?: SnackbarType;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load videos
  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVideos();
      const formattedData = data.map((video: Video) => ({
        ...video,
        date: formatDateForInput(video.date),
      }));
      setVideos(formattedData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat video";
      setError(msg);
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Update form video
  const updateVideo = useCallback((updates: Partial<Video>) => {
    setVideoForm((prev) => ({ ...prev, ...updates }));
  }, []);

  // Open modal (tambah/edit)
  const openModal = useCallback((video?: Video) => {
    if (video) {
      const formattedVideo = {
        ...video,
        date: formatDateForInput(video.date),
      };
      setVideoForm(formattedVideo);
      setEditingVideo(formattedVideo);
    } else {
      setVideoForm({
        titleVidio: "",
        deskripsi: "",
        date: "",
        youtubeUrl: "",
      });
      setEditingVideo(null);
    }
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setVideoForm({
      titleVidio: "",
      deskripsi: "",
      date: "",
      youtubeUrl: "",
    });
    setEditingVideo(null);
  }, []);

  // Save video (POST/PUT)
  const handleSave = useCallback(async () => {
    if (!videoForm.titleVidio.trim() || !videoForm.date || !videoForm.youtubeUrl.trim()) {
      setSnackbar({
        message: "Judul, tanggal, dan URL YouTube wajib diisi!",
        type: "error",
      });
      return;
    }

    const videoId = parseYouTubeId(videoForm.youtubeUrl);
    if (!videoId) {
      setSnackbar({
        message: "URL YouTube tidak valid!",
        type: "error",
      });
      return;
    }

    const embedUrl = getEmbedUrl(videoId);

    const dateObj = new Date(videoForm.date);
    if (isNaN(dateObj.getTime())) {
      setSnackbar({
        message: "Tanggal tidak valid!",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = { ...videoForm, youtubeUrl: embedUrl };
      const url = editingVideo?._id ? `/api/video/${editingVideo._id}` : "/api/video";
      const method = editingVideo?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal menyimpan video");
      }

      await loadVideos();
      setSnackbar({
        message: editingVideo ? "Video berhasil diperbarui!" : "Video berhasil dibuat!",
        type: "success",
      });
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan video";
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  }, [videoForm, editingVideo, loadVideos, closeModal]);

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/video/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await res.text() || "Gagal menghapus video");
      }
      setSnackbar({ message: "Video berhasil dihapus!", type: "success" });
      await loadVideos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal hapus video";
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadVideos]);

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
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Video</h1>
                <p className="text-gray-600 mt-1">Kelola Video RPTRA</p>
              </div>
            </div>
            <Button
              onClick={() => openModal()}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              disabled={saving || deleting}
            >
              <Plus className="w-5 h-5" />
              Tambah Video
            </Button>
          </div>
        </div>
      </div>

      {/* List Videos */}
      <main>
        {loading ? (
          <AdminLoading message="Memuat video..." fullScreen />
        ) : error ? (
          <Card className="bg-red-50 text-red-600 p-4 rounded-lg flex gap-2 items-center">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </Card>
        ) : videos.length === 0 ? (
          <Card className="text-center py-12">
            <PlayCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Tidak ada video tersedia.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <Card
                key={v._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
                aria-labelledby={`video-${v._id}-title`}
              >
                <iframe
                  src={v.youtubeUrl}
                  title={v.titleVidio}
                  className="w-full h-56 rounded-t-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
                <div className="p-5">
                  <h3 id={`video-${v._id}-title`} className="font-semibold text-lg mb-2 line-clamp-2">
                    {v.titleVidio}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                    {v.deskripsi || "Tanpa deskripsi"}
                  </p>
                  {v.date && (
                    <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateForDisplay(v.date)}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(v)}
                      aria-label={`Edit ${v.titleVidio}`}
                      disabled={saving || deleting}
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(v)}
                      aria-label={`Hapus ${v.titleVidio}`}
                      disabled={deleting || saving}
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {isModalOpen && (
        <VideoForm
          video={videoForm}
          setVideo={updateVideo}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
          isEditing={!!editingVideo}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          video={deleteTarget}
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

export default VideoManagementPage;