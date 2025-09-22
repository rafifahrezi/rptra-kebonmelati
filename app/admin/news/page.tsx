"use client";
import React, { memo, useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  FileText,
  ArrowLeft,
} from "lucide-react";
import AdminLoading from "@/app/admin/loading";
import Link from "next/link";

interface NewsItem {
  _id?: string;
  id?: string; // for compatibility
  title: string;
  subtitle?: string;
  content: string;
  category?: string;
  author?: string;
  featured: boolean;
  published: boolean;
  tags: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Snackbar Component
const Snackbar = memo(({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-slide-up">
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200" aria-label="Close snackbar">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
});

// Loading Component
const LoadingState = memo(() => (
    <AdminLoading message="Memuat Data Berita..." fullScreen />
));

// Header Component
const Header = memo(({ onAddNews }: { onAddNews: () => void }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Berita Admin</h1>
          <p className="text-gray-600">Tambah, edit, dan kelola semua berita RPTR</p>
        </div>
      </div>
      <button
        onClick={onAddNews}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Berita Baru
      </button>
    </div>
  </div>
));

// FilterSection Component
const FilterSection = memo(
  ({
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    categories,
  }: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    filterCategory: string;
    setFilterCategory: (value: string) => void;
    categories: string[];
  }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
);

// NewsList Component
const NewsList = memo(
  ({
    newsList,
    onEdit,
    onDelete,
    onRefresh,
    formatDate,
  }: {
    newsList: NewsItem[];
    onEdit: (news: NewsItem) => void;
    onDelete: (id: string) => void;
    onRefresh: () => void;
    formatDate: (timestamp?: string) => string;
  }) => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Daftar Berita ({newsList.length})</h2>
        <button
          onClick={onRefresh}
          className="text-green-600 hover:text-green-700 text-sm"
        >
          Refresh Data
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <div key={news._id ?? news.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{news.title}</h3>
                    <div className="flex gap-2">
                      {news.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Featured</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${news.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {news.published ? "Published" : "Draft"}
                      </span>
                      {news.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{news.category}</span>
                      )}
                    </div>
                  </div>
                  {news.subtitle && <p className="text-gray-600 mb-2">{news.subtitle}</p>}
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{news.content?.substring(0, 150)}...</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {news.author || "Admin"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(news.createdAt)}
                    </div>
                    {news.tags?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {news.tags.slice(0, 2).join(", ")}
                        {news.tags.length > 2 && ` +${news.tags.length - 2}`}
                      </div>
                    )}
                  </div>
                </div>
                {news.images && news.images.length > 0 && (
                  <div className="ml-4 flex-shrink-0">
                    <img src={news.images[0]} alt={news.title} className="w-20 h-20 object-cover rounded-md" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => onEdit(news)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors group"
                  title="Edit berita"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(news._id ?? news.id ?? "")}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Hapus berita"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Belum ada berita yang tersedia</p>
            <p className="text-sm mt-2">Klik "Tambah Berita Baru" untuk membuat berita pertama</p>
          </div>
        )}
      </div>
    </div>
  )
);

// NewsForm Component
interface NewsFormProps {
  newsForm: NewsItem;
  setNewsForm: (updates: Partial<NewsItem>) => void;
  imagesPreview: string[];
  setImagesPreview: (images: string[]) => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
  addTag: () => void;
  removeTag: (tag: string) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  categories: string[];
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isEditing: boolean;
}

const NewsForm: React.FC<NewsFormProps> = ({
  newsForm,
  setNewsForm,
  imagesPreview,
  setImagesPreview,
  handleImageUpload,
  uploadingImage,
  addTag,
  removeTag,
  newTag,
  setNewTag,
  categories,
  onSave,
  onCancel,
  saving,
  isEditing,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] shadow-xl transform transition-all duration-300 ease-in-out">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {isEditing ? "Edit Berita" : "Tambah Berita Baru"}
              </h2>
              <p className="text-emerald-100 text-sm">Isi detail berita dengan lengkap dan akurat</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Tutup modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          {/* Judul */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Judul *</label>
            <input
              type="text"
              value={newsForm.title}
              onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              maxLength={200}
              placeholder="Masukkan judul berita"
            />
            <div className="absolute bottom-3 right-3 bg-white px-2 rounded text-xs text-gray-500">
              {newsForm.title.length}/200
            </div>
          </div>

          {/* Subjudul */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjudul</label>
            <input
              type="text"
              value={newsForm.subtitle || ""}
              onChange={(e) => setNewsForm({ ...newsForm, subtitle: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              maxLength={300}
              placeholder="Masukkan subjudul (opsional)"
            />
            <div className="absolute bottom-3 right-3 bg-white px-2 rounded text-xs text-gray-500">
              {newsForm.subtitle?.length || 0}/300
            </div>
          </div>

          {/* Isi Konten */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Isi Konten *</label>
            <textarea
              rows={6}
              value={newsForm.content}
              onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-y placeholder-gray-400 min-h-[150px]"
              maxLength={10000}
              placeholder="Masukkan isi konten berita"
            />
            <div className="absolute bottom-3 right-3 bg-white px-2 rounded text-xs text-gray-500">
              {newsForm.content.length}/10000
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <div className="relative">
                <select
                  value={newsForm.category || ""}
                  onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none bg-white pr-10"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Penulis */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Penulis</label>
              <input
                type="text"
                value={newsForm.author || ""}
                onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
                maxLength={100}
                placeholder="Masukkan nama penulis"
              />
              <div className="absolute bottom-3 right-3 bg-white px-2 rounded text-xs text-gray-500">
                {newsForm.author?.length || 0}/100
              </div>
            </div>
          </div>

          {/* Checkbox Options */}
          <div className="flex flex-wrap gap-6 py-2">
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={newsForm.featured}
                  onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    newsForm.featured ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300"
                  } border`}
                >
                  {newsForm.featured && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={newsForm.published}
                  onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    newsForm.published ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300"
                  } border`}
                >
                  {newsForm.published && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span>Published</span>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Masukkan tag baru dan tekan Enter"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-all duration-200 flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Tambah</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newsForm.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-emerald-50 text-emerald-800 text-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-all duration-200 group"
                >
                  <span className="max-w-[120px] truncate">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-emerald-500 hover:text-emerald-800 focus:outline-none transition-colors duration-200 group-hover:bg-emerald-100 rounded-full p-0.5"
                    aria-label={`Hapus tag ${tag}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Utama</label>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    uploadingImage
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Unggah Gambar
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center max-w-[140px]">Format JPG, PNG<br />Maks 2MB</p>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex gap-2 flex-wrap">
                {imagesPreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm transition-all duration-200 group-hover:shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = imagesPreview.filter((_, i) => i !== index);
                        setImagesPreview(newImages);
                        setNewsForm({ images: newImages });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label={`Hapus gambar ${index + 1}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {!imagesPreview.length && (
                  <div className="relative w-28 h-28 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs mt-1">No Image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl text-white transition-all duration-200 flex items-center gap-2 ${
                saving ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md"
              }`}
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Simpan Berita
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main NewsAdmin Component
const NewsAdmin: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [saving, setSaving] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const [newsForm, setNewsFormState] = useState<NewsItem>({
    title: "",
    subtitle: "",
    content: "",
    category: "",
    author: "",
    featured: false,
    published: true,
    tags: [],
    images: [],
  });

  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState("");

  const categories = [
    "Berita Umum",
    "Program Anak",
    "Kegiatan Komunitas",
    "Kesehatan",
    "Pendidikan",
    "Event",
    "Pengumuman",
  ];

  const setNewsForm = useCallback((updates: Partial<NewsItem>) => {
    setNewsFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadNewsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed to fetch news");
      const data: NewsItem[] = await res.json();
      setNewsList(data);
    } catch (error) {
      console.error("Error loading news:", error);
      setSnackbarMessage("Gagal memuat berita.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNewsData();
  }, [loadNewsData]);

  const resetForm = useCallback(() => {
    setNewsForm({
      title: "",
      subtitle: "",
      content: "",
      category: "",
      author: "",
      featured: false,
      published: true,
      tags: [],
      images: [],
    });
    setImagesPreview([]);
    setEditingNews(null);
    setNewTag("");
  }, [setNewsForm]);

  const openModal = useCallback((news?: NewsItem) => {
    if (news) {
      setNewsForm({
        ...news,
        id: news._id ?? news.id,
        images: news.images || [],
      });
      setImagesPreview(news.images || []);
      setEditingNews(news);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  }, [resetForm, setNewsForm]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleImageUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setUploadingImage(true);
      const newPreviews: string[] = [...imagesPreview];
      try {
        for (const file of Array.from(files)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              const imageUrl = e.target.result as string;
              newPreviews.push(imageUrl);
              setImagesPreview(newPreviews);
              setNewsForm({ images: newPreviews });
            }
          };
          reader.readAsDataURL(file);
        }
        setSnackbarMessage("Gambar berhasil diupload (preview)");
      } catch (error) {
        console.error("Error uploading images:", error);
        setSnackbarMessage("Gagal mengupload gambar.");
      } finally {
        setUploadingImage(false);
      }
    },
    [imagesPreview, setImagesPreview, setNewsForm]
  );

  const addTag = useCallback(() => {
    if (newTag.trim() && !newsForm.tags.includes(newTag.trim())) {
      setNewsForm({ tags: [...newsForm.tags, newTag.trim()] });
      setNewTag("");
    }
  }, [newTag, newsForm.tags, setNewsForm]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      setNewsForm({ tags: newsForm.tags.filter((tag) => tag !== tagToRemove) });
    },
    [newsForm.tags, setNewsForm]
  );

  const handleSave = useCallback(async () => {
    if (!newsForm.title.trim()) {
      setSnackbarMessage("Judul berita harus diisi!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: newsForm.title,
        subtitle: newsForm.subtitle ?? "",
        content: newsForm.content,
        category: newsForm.category ?? "",
        author: newsForm.author ?? "",
        featured: newsForm.featured,
        published: newsForm.published,
        tags: newsForm.tags,
        images: newsForm.images ?? [],
      };

      let res: Response;

      if (editingNews && (editingNews._id || editingNews.id)) {
        res = await fetch(`/api/news/${editingNews._id ?? editingNews.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan berita");
      }

      setSnackbarMessage(editingNews ? "Berita berhasil diupdate!" : "Berita berhasil dibuat!");
      closeModal();
      loadNewsData();
    } catch (error) {
      console.error("Error saving news:", error);
      setSnackbarMessage((error as Error).message || "Gagal menyimpan berita.");
    } finally {
      setSaving(false);
    }
  }, [newsForm, editingNews, closeModal, loadNewsData]);

  const handleDelete = useCallback(
    async (newsId: string) => {
      if (!newsId) return;
      if (window.confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
        try {
          const res = await fetch(`/api/news/${newsId}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Gagal menghapus berita");
          }
          setSnackbarMessage("Berita berhasil dihapus!");
          loadNewsData();
        } catch (error) {
          console.error("Error deleting news:", error);
          setSnackbarMessage((error as Error).message || "Gagal menghapus berita.");
        }
      }
    },
    [loadNewsData]
  );

  const filteredNews = newsList.filter((news) => {
    const matchesSearch =
      news.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || news.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const formatDate = useCallback((timestamp?: string): string => {
    if (!timestamp) return "Tidak diketahui";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Tidak valid";
    }
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Header onAddNews={() => openModal()} />
        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={categories}
        />
        <NewsList
          newsList={filteredNews}
          onEdit={openModal}
          onDelete={handleDelete}
          onRefresh={loadNewsData}
          formatDate={formatDate}
        />
        {isModalOpen && (
          <NewsForm
            newsForm={newsForm}
            setNewsForm={setNewsForm}
            imagesPreview={imagesPreview}
            setImagesPreview={setImagesPreview}
            handleImageUpload={handleImageUpload}
            uploadingImage={uploadingImage}
            addTag={addTag}
            removeTag={removeTag}
            newTag={newTag}
            setNewTag={setNewTag}
            categories={categories}
            onSave={handleSave}
            onCancel={closeModal}
            saving={saving}
            isEditing={!!editingNews}
          />
        )}
        {snackbarMessage && <Snackbar message={snackbarMessage} onClose={() => setSnackbarMessage(null)} />}
      </div>
    </div>
  );
};

export default NewsAdmin;