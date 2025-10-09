"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, ChevronDown, Plus, Trash2, ArrowLeft, Info, Upload, Eye, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import AdminLoading from "@/app/admin/loading";

// ================= Types =================
interface FacilityItem {
  name: string;
  description: string;
}

interface ProgramItem {
  name: string;
  description: string;
}

interface PartnerItem {
  name: string;
  role: string;
}

interface AboutData {
  title: string;
  subtitle: string;
  mission: { title: string; description: string; image: string };
  vision: { title: string; description: string; image: string };
  values: { title: string; description: string };
  programs: { title: string; description: string; items: ProgramItem[] };
  facilities: { title: string; description: string; items: FacilityItem[]; images: string[] };
  collaborations: { title: string; description: string; partners: PartnerItem[] };
  operational: { title: string; hours: Record<string, string> };
  establishedYear: string;
  establishedText: string;
  lastUpdated: string;
}

// ================= Constants =================
const defaultAboutData: AboutData = {
  title: "About RPTRA Kebon Melati",
  subtitle: "Ruang Publik Terpadu Ramah Anak di Jakarta Pusat",
  mission: { title: "Misi Kami", description: "Menyediakan ruang aman...", image: "" },
  vision: { title: "Visi", description: "Menjadi ruang publik terdepan...", image: "" },
  values: { title: "Nilai-Nilai", description: "Keamanan, Pendidikan, Komunitas, dan Inovasi." },
  programs: {
    title: "Program Kami",
    description: "Beragam program yang mendukung anak dan masyarakat.",
    items: [
      { name: "Program Pendidikan Anak", description: "Kegiatan belajar interaktif." },
      { name: "Program Kesehatan Masyarakat", description: "Edukasi kesehatan dan pemeriksaan rutin." },
    ],
  },
  facilities: {
    title: "Fasilitas",
    description: "Fasilitas lengkap untuk anak dan keluarga.",
    items: [
      { name: "Ruang Bermain Anak", description: "Area bermain aman dan menyenangkan." },
      { name: "Perpustakaan Mini", description: "Koleksi buku untuk anak dan dewasa." },
    ],
    images: [],
  },
  collaborations: {
    title: "Kemitraan",
    description: "Bekerjasama dengan berbagai pihak.",
    partners: [
      { name: "Dinas Sosial DKI Jakarta", role: "Pembina" },
      { name: "Puskesmas Setempat", role: "Partner Kesehatan" },
    ],
  },
  operational: {
    title: "Jam Operasional",
    hours: {
      senin: "06:00 - 13:00",
      selasa: "06:00 - 12:00",
      rabu: "06:00 - 12:00",
      kamis: "06:00 - 12:00",
      jumat: "06:00 - 13:00",
      sabtu: "08:00 - 14:00",
      minggu: "08:00 - 14:00",
    },
  },
  establishedYear: "2017",
  establishedText: "Berdiri Sejak",
  lastUpdated: new Date().toISOString(),
};

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FACILITY_IMAGES = 4;

// ================= Helper Functions =================
const getImageUrl = (imageId: string): string => imageId ? `/api/files/${imageId}` : '';

// ================= Reusable Components =================

// Snackbar Component
const Snackbar = memo(({ 
  message, 
  type = 'success', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error'; 
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-80 max-w-md ${bgColor} text-white z-50`}>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

// Loading Spinner Component
const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
  
  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
  );
};

// Form Field Components
const TextField = memo(({ 
  label, 
  value, 
  onChange, 
  placeholder = "",
  required = false 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
    />
  </div>
));

const TextAreaField = memo(({ 
  label, 
  value, 
  onChange, 
  placeholder = "",
  required = false,
  rows = 4
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
    />
  </div>
));

// Image Upload Slot Component
const ImageUploadSlot = memo(({
  index,
  imageId,
  isUploading,
  onUpload,
  onRemove,
  onPreview
}: {
  index: number;
  imageId: string | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onPreview: () => void;
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  if (imageId) {
    return (
      <div className="relative group aspect-square rounded-xl border-2 border-green-200 bg-green-50 overflow-hidden">
        <img
          src={getImageUrl(imageId)}
          alt={`Upload ${index + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPreview}
              className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors"
              title="Lihat gambar"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={isUploading}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
              title="Hapus gambar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slot Number Badge */}
        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
          {index + 1}
        </div>
      </div>
    );
  }

  return (
    <label
      className={`
        flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed 
        cursor-pointer transition-all duration-200 p-4
        ${dragOver 
          ? 'border-green-400 bg-green-50' 
          : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
        }
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center text-center">
        {isUploading ? (
          <LoadingSpinner size="md" />
        ) : (
          <>
            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 mb-1">
              Slot {index + 1}
            </span>
            <span className="text-xs text-gray-500">
              Klik atau drag file
            </span>
          </>
        )}
      </div>
    </label>
  );
});

// Accordion Section Component
const AccordionSection = memo(({
  title,
  children,
  isOpen,
  toggleOpen,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggleOpen: () => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <button
      onClick={toggleOpen}
      className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
    >
      <h2 className="text-xl font-semibold flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Edit2 className="w-5 h-5 text-blue-600" />
        </div>
        {title}
      </h2>
      <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[5000px]" : "max-h-0"}`}>
      <div className="px-6 pb-6 space-y-6">{children}</div>
    </div>
  </div>
));

// List Manager Component for Programs, Facilities, Partners
const ListManager = memo(({
  items,
  onItemsChange,
  itemRenderer,
  addButtonText,
  emptyMessage,
}: {
  items: any[];
  onItemsChange: (items: any[]) => void;
  itemRenderer: (item: any, index: number, onUpdate: (updatedItem: any) => void) => React.ReactNode;
  addButtonText: string;
  emptyMessage?: string;
}) => {
  const addItem = () => {
    onItemsChange([...items, {}]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updatedItem: any) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && emptyMessage ? (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        items.map((item, index) => (
          <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex-1 space-y-4">
              {itemRenderer(item, index, (updatedItem) => updateItem(index, updatedItem))}
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="flex items-start gap-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mt-1" />
              <span className="text-sm">Hapus</span>
            </button>
          </div>
        ))
      )}
      
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 px-4 py-3 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg border-2 border-dashed border-green-300 transition-colors w-full justify-center"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">{addButtonText}</span>
      </button>
    </div>
  );
});

// ================= Main Page =================
const AboutAdminPage = () => {
  const router = useRouter();
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [openSections, setOpenSections] = useState({
    hero: true,
    mission: false,
    vision: false,
    values: false,
    programs: false,
    facilities: false,
    collaborations: false,
    operational: false,
    established: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  // ================= Effects =================
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (!res.ok) throw new Error("Unauthorized");
        setLoading(false);
      } catch {
        setAuthError("Sesi tidak valid");
        router.push("/admin?error=unauthorized");
      }
    };

    verifyAuth();
  }, [router]);

  useEffect(() => {
    const loadAboutData = async () => {
      if (authError) return;

      try {
        const res = await fetch("/api/about", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load data");
        
        const data = await res.json();
        if (data.about) {
          setAboutData({ ...defaultAboutData, ...data.about });
        }
      } catch {
        showSnackbar("Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadAboutData();
  }, [authError]);

  // ================= Helper Functions =================
  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ message, type });
  };

  const updateData = useCallback(<K extends keyof AboutData>(field: K, value: AboutData[K]) => {
    setAboutData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // ================= Image Handlers =================
  const handleImageUpload = async (
    file: File, 
    onSuccess: (fileId: string) => void,
    onError: (error: string) => void
  ) => {
    if (file.size > MAX_FILE_SIZE) {
      onError("Ukuran file terlalu besar (maks 5MB)");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      onError('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal upload gambar");
      }

      const data = await res.json();
      
      if (!data.fileId) {
        throw new Error("ID gambar tidak ditemukan");
      }

      onSuccess(data.fileId);
      showSnackbar("Gambar berhasil diupload!");
    } catch (err: any) {
      console.error("Upload error:", err);
      onError(err.message || "Gagal upload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async (imageId: string, onSuccess: () => void) => {
    try {
      await fetch(`/api/files/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      onSuccess();
      showSnackbar("Gambar berhasil dihapus!");
    } catch (err: any) {
      console.error("Error menghapus gambar:", err);
      showSnackbar("Gagal menghapus gambar", "error");
    }
  };

  // Facility Images Handlers
  const handleFacilityImageUpload = useCallback(async (file: File, index: number) => {
    handleImageUpload(
      file,
      (fileId) => {
        const currentImages = aboutData.facilities.images || [];
        const newImages = [...currentImages];
        newImages[index] = fileId;
        updateData("facilities", { ...aboutData.facilities, images: newImages });
      },
      (error) => showSnackbar(error, "error")
    );
  }, [aboutData.facilities, updateData]);

  const handleFacilityImageRemove = useCallback(async (index: number) => {
    const currentImages = aboutData.facilities.images || [];
    const imageToRemove = currentImages[index];

    if (!imageToRemove) return;

    handleImageRemove(imageToRemove, () => {
      const newImages = currentImages.filter((_, i) => i !== index);
      updateData("facilities", { ...aboutData.facilities, images: newImages });
    });
  }, [aboutData.facilities, updateData]);

  // Mission Image Handlers
  const handleMissionImageUpload = useCallback(async (file: File) => {
    handleImageUpload(
      file,
      (fileId) => updateData("mission", { ...aboutData.mission, image: fileId }),
      (error) => showSnackbar(error, "error")
    );
  }, [aboutData.mission, updateData]);

  const handleMissionImageRemove = useCallback(async () => {
    const imageToRemove = aboutData.mission.image;
    if (!imageToRemove) return;

    handleImageRemove(imageToRemove, () => {
      updateData("mission", { ...aboutData.mission, image: "" });
    });
  }, [aboutData.mission, updateData]);

  // ================= Save Handler =================
  const handleSave = async () => {
    setSaving(true);

    try {
      // Validasi jumlah gambar fasilitas
      if (aboutData.facilities.images.length > MAX_FACILITY_IMAGES) {
        throw new Error(`Maksimal ${MAX_FACILITY_IMAGES} gambar fasilitas`);
      }

      const res = await fetch("/api/about", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...aboutData, 
          lastUpdated: new Date().toISOString() 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan data");
      }

      showSnackbar("Data berhasil disimpan!");
    } catch (err: any) {
      console.error("Save error:", err);
      showSnackbar(err.message || "Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  // ================= Render =================
  if (loading || authError) {
    return <AdminLoading message="Memverifikasi akses admin..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Link>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Manajemen Halaman About
                </h1>
                <p className="text-gray-600">
                  Kelola konten dan informasi halaman About RPTRA
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
            >
              {saving ? <LoadingSpinner /> : <Save className="w-5 h-5" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <AccordionSection title="Hero Section" isOpen={openSections.hero} toggleOpen={() => toggleSection("hero")}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextField 
              label="Judul Utama" 
              value={aboutData.title} 
              onChange={(v) => updateData("title", v)}
              placeholder="Masukkan judul utama halaman about"
              required
            />
            <TextAreaField 
              label="Subtitle" 
              value={aboutData.subtitle} 
              onChange={(v) => updateData("subtitle", v)}
              placeholder="Masukkan deskripsi singkat tentang RPTRA"
              required
            />
            <TextField 
              label="Teks Tahun Berdiri" 
              value={aboutData.establishedText} 
              onChange={(v) => updateData("establishedText", v)}
              placeholder="Contoh: Berdiri Sejak"
            />
            <TextField 
              label="Tahun Berdiri" 
              value={aboutData.establishedYear} 
              onChange={(v) => updateData("establishedYear", v)}
              placeholder="Contoh: 2017"
            />
          </div>
        </AccordionSection>

        {/* Mission Section */}
        <AccordionSection title="Misi" isOpen={openSections.mission} toggleOpen={() => toggleSection("mission")}>
          <div className="space-y-6">
            <TextField
              label="Judul Misi"
              value={aboutData.mission.title}
              onChange={(v) => updateData("mission", { ...aboutData.mission, title: v })}
              required
            />
            <TextAreaField
              label="Deskripsi Misi"
              value={aboutData.mission.description}
              onChange={(v) => updateData("mission", { ...aboutData.mission, description: v })}
              required
              rows={4}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Gambar Misi</label>
              {aboutData.mission.image ? (
                <div className="flex items-start gap-4">
                  <div className="relative w-64 h-48">
                    <img 
                      src={getImageUrl(aboutData.mission.image)} 
                      alt="Mission" 
                      className="w-full h-full object-cover rounded-lg border-2 border-green-200"
                    />
                    <button
                      type="button"
                      onClick={handleMissionImageRemove}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => window.open(getImageUrl(aboutData.mission.image), '_blank')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Gambar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Pilih Gambar Misi</span>
                    <input
                      type="file"
                      accept={ALLOWED_FILE_TYPES.join(',')}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMissionImageUpload(file);
                      }}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500">
                    Format: JPG, PNG, WebP (maks. 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </AccordionSection>

        {/* Programs Section */}
        <AccordionSection title="Program" isOpen={openSections.programs} toggleOpen={() => toggleSection("programs")}>
          <TextField
            label="Judul Program"
            value={aboutData.programs.title}
            onChange={(v) => updateData("programs", { ...aboutData.programs, title: v })}
            required
          />
          <TextAreaField
            label="Deskripsi Program"
            value={aboutData.programs.description}
            onChange={(v) => updateData("programs", { ...aboutData.programs, description: v })}
            required
          />
          
          <ListManager
            items={aboutData.programs.items}
            onItemsChange={(items) => updateData("programs", { ...aboutData.programs, items })}
            addButtonText="Tambah Program"
            emptyMessage="Belum ada program yang ditambahkan"
            itemRenderer={(item, index, onUpdate) => (
              <div className="space-y-4">
                <TextField
                  label="Nama Program"
                  value={item.name || ''}
                  onChange={(v) => onUpdate({ ...item, name: v })}
                  placeholder="Masukkan nama program"
                  required
                />
                <TextAreaField
                  label="Deskripsi Program"
                  value={item.description || ''}
                  onChange={(v) => onUpdate({ ...item, description: v })}
                  placeholder="Masukkan deskripsi program"
                  required
                />
              </div>
            )}
          />
        </AccordionSection>

        {/* Facilities Section */}
        <AccordionSection title="Fasilitas" isOpen={openSections.facilities} toggleOpen={() => toggleSection("facilities")}>
          <TextField
            label="Judul Fasilitas"
            value={aboutData.facilities.title}
            onChange={(v) => updateData("facilities", { ...aboutData.facilities, title: v })}
            required
          />
          <TextAreaField
            label="Deskripsi Fasilitas"
            value={aboutData.facilities.description}
            onChange={(v) => updateData("facilities", { ...aboutData.facilities, description: v })}
            required
          />

          {/* Facility Items */}
          <ListManager
            items={aboutData.facilities.items}
            onItemsChange={(items) => updateData("facilities", { ...aboutData.facilities, items })}
            addButtonText="Tambah Fasilitas"
            emptyMessage="Belum ada fasilitas yang ditambahkan"
            itemRenderer={(item, index, onUpdate) => (
              <div className="space-y-4">
                <TextField
                  label="Nama Fasilitas"
                  value={item.name || ''}
                  onChange={(v) => onUpdate({ ...item, name: v })}
                  placeholder="Masukkan nama fasilitas"
                  required
                />
                <TextAreaField
                  label="Deskripsi Fasilitas"
                  value={item.description || ''}
                  onChange={(v) => onUpdate({ ...item, description: v })}
                  placeholder="Masukkan deskripsi fasilitas"
                  required
                />
              </div>
            )}
          />

          {/* Facility Images */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gambar Fasilitas</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload maksimal {MAX_FACILITY_IMAGES} gambar untuk menampilkan fasilitas
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <span>{aboutData.facilities.images?.length || 0}/{MAX_FACILITY_IMAGES}</span>
                <span>Gambar</span>
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: MAX_FACILITY_IMAGES }).map((_, index) => (
                <ImageUploadSlot
                  key={index}
                  index={index}
                  imageId={aboutData.facilities.images?.[index] || null}
                  isUploading={isUploading}
                  onUpload={(file) => handleFacilityImageUpload(file, index)}
                  onRemove={() => handleFacilityImageRemove(index)}
                  onPreview={() => window.open(getImageUrl(aboutData.facilities.images[index]), '_blank')}
                />
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900">Panduan Upload Gambar</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Format yang didukung: JPG, PNG, WebP</li>
                    <li>• Ukuran maksimal per file: 5MB</li>
                    <li>• Rasio gambar disarankan: 1:1 (persegi)</li>
                    <li>• Slot 1, 2, dan 4: Ukuruan 400x400 pixels</li>
                    <li>• Slot 3: Ukuruan 400x600 pixels</li>                  </ul>
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Collaborations Section */}
        <AccordionSection title="Kemitraan" isOpen={openSections.collaborations} toggleOpen={() => toggleSection("collaborations")}>
          <TextField
            label="Judul Kemitraan"
            value={aboutData.collaborations.title}
            onChange={(v) => updateData("collaborations", { ...aboutData.collaborations, title: v })}
            required
          />
          <TextAreaField
            label="Deskripsi Kemitraan"
            value={aboutData.collaborations.description}
            onChange={(v) => updateData("collaborations", { ...aboutData.collaborations, description: v })}
            required
          />
          
          <ListManager
            items={aboutData.collaborations.partners}
            onItemsChange={(partners) => updateData("collaborations", { ...aboutData.collaborations, partners })}
            addButtonText="Tambah Mitra"
            emptyMessage="Belum ada mitra yang ditambahkan"
            itemRenderer={(item, index, onUpdate) => (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TextField
                  label="Nama Mitra"
                  value={item.name || ''}
                  onChange={(v) => onUpdate({ ...item, name: v })}
                  placeholder="Masukkan nama mitra"
                  required
                />
                <TextField
                  label="Peran Mitra"
                  value={item.role || ''}
                  onChange={(v) => onUpdate({ ...item, role: v })}
                  placeholder="Masukkan peran mitra"
                  required
                />
              </div>
            )}
          />
        </AccordionSection>

        {/* Operational Hours Section */}
        <AccordionSection title="Jam Operasional" isOpen={openSections.operational} toggleOpen={() => toggleSection("operational")}>
          <TextField
            label="Judul Jam Operasional"
            value={aboutData.operational.title}
            onChange={(v) => updateData("operational", { ...aboutData.operational, title: v })}
            required
          />
          
          <div className="space-y-3">
            {Object.entries(aboutData.operational.hours).map(([day, time]) => (
              <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <label className="w-24 capitalize text-sm font-medium text-gray-700">
                  {day}
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => {
                    const newHours = { ...aboutData.operational.hours, [day]: e.target.value };
                    updateData("operational", { ...aboutData.operational, hours: newHours });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: 08:00 - 17:00"
                />
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* Snackbar */}
        {snackbar && (
          <Snackbar
            message={snackbar.message}
            type={snackbar.type}
            onClose={() => setSnackbar(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AboutAdminPage;