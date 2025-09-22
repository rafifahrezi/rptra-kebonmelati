"use client";

import { memo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, ChevronDown, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AdminLoading from "@/app/admin/loading";


// ================= Types =================
interface FacilityItem {
  name: string;
  description: string;
  images: string[];
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
  facilities: { title: string; description: string; items: FacilityItem[] };
  collaborations: { title: string; description: string; partners: PartnerItem[] };
  operational: { title: string; hours: Record<string, string> };
  establishedYear: string;
  establishedText: string;
  lastUpdated: string;
}

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
      { name: "Ruang Bermain Anak", description: "Area bermain aman dan menyenangkan.", images: [] },
      { name: "Perpustakaan Mini", description: "Koleksi buku untuk anak dan dewasa.", images: [] },
    ],
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

// ================= Field Components =================
const TextField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
    />
  </div>
);

const TextAreaField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
    />
  </div>
);

// ================= Accordion =================
const AccordionSection = memo(
  ({
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
    <div className="bg-white rounded-lg shadow">
      <button
        onClick={toggleOpen}
        className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Edit2 className="w-5 h-5" />
          {title}
        </h2>
        <ChevronDown className={`w-6 h-6 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-max-height duration-300 ease-in-out ${isOpen ? "max-h-[2000px]" : "max-h-0"}`}>
        <div className="px-6 pb-6 space-y-4">{children}</div>
      </div>
    </div>
  )
);

// ================= Main Page =================
const AboutAdminPage = () => {
  const router = useRouter();
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
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

  useEffect(() => {
    fetch("/api/auth/verify", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        setLoading(false);
      })
      .catch(() => {
        setAuthError("Sesi tidak valid");
        router.push("/admin?error=unauthorized");
      });
  }, [router]);

  useEffect(() => {
    if (!authError) {
      fetch("/api/about", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.about) setAboutData({ ...defaultAboutData, ...data.about });
        })
        .catch(() => setSnackbar("Gagal memuat data"))
        .finally(() => setLoading(false));
    }
  }, [authError]);

  const updateData = <K extends keyof AboutData>(field: K, value: AboutData[K]) => {
    setAboutData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/about", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...aboutData, lastUpdated: new Date().toISOString() }),
      });
      setSnackbar("Data berhasil disimpan!");
    } catch {
      setSnackbar("Gagal menyimpan data!");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authError) {
    return <AdminLoading message="Memverifikasi akses admin..." fullScreen />;
  }
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Manajemen Halaman About Admin
              </h1>
              <p className="text-gray-600">
                Kelola Halaman About dan pengaturan Informasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <AccordionSection title="Hero Section" isOpen={openSections.hero} toggleOpen={() => toggleSection("hero")}>
        <TextField label="Judul Utama" value={aboutData.title} onChange={(v) => updateData("title", v)} />
        <TextAreaField label="Subtitle" value={aboutData.subtitle} onChange={(v) => updateData("subtitle", v)} />
        <TextAreaField label="Judul Tahun" value={aboutData.establishedText} onChange={(v) => updateData("establishedText", v)} />
        <TextAreaField label="Tahun Bentuk" value={aboutData.establishedYear} onChange={(v) => updateData("establishedYear", v)} />
      </AccordionSection>

      {/* Mission */}
      <AccordionSection title="Mission" isOpen={openSections.mission} toggleOpen={() => toggleSection("mission")}>
        <TextField
          label="Judul Misi"
          value={aboutData.mission.title}
          onChange={(v) => updateData("mission", { ...aboutData.mission, title: v })}
        />
        <TextAreaField
          label="Deskripsi Misi"
          value={aboutData.mission.description}
          onChange={(v) => updateData("mission", { ...aboutData.mission, description: v })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Misi</label>
          {aboutData.mission.image ? (
            <div className="relative w-64">
              <img src={aboutData.mission.image} alt="Mission" className="w-full h-40 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={() => updateData("mission", { ...aboutData.mission, image: "" })}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                      credentials: "include",
                    });

                    if (!res.ok) throw new Error("Gagal upload gambar");
                    const data = await res.json();

                    updateData("mission", { ...aboutData.mission, image: data.url });
                    setSnackbar("Gambar berhasil diupload!");
                  } catch (err: any) {
                    console.error('Upload error:', err.message);
                    setSnackbar("Gagal upload gambar");
                  }
                }}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                  file:rounded-md file:border-0 file:text-sm file:font-semibold
                  file:bg-green-600 file:text-white hover:file:bg-green-700"
              />
              <p className="text-xs text-gray-500">Format: JPG, PNG (max 2MB)</p>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Programs */}
      <AccordionSection title="Programs" isOpen={openSections.programs} toggleOpen={() => toggleSection("programs")}>
        <TextField
          label="Judul Program"
          value={aboutData.programs.title}
          onChange={(v) => updateData("programs", { ...aboutData.programs, title: v })}
        />
        <TextAreaField
          label="Deskripsi Program"
          value={aboutData.programs.description}
          onChange={(v) => updateData("programs", { ...aboutData.programs, description: v })}
        />
        <div className="space-y-2">
          {aboutData.programs.items.map((item: ProgramItem, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <TextField
                label="Nama Item"
                value={item.name}
                onChange={(v) => {
                  const newItems = [...aboutData.programs.items];
                  newItems[idx].name = v;
                  updateData("programs", { ...aboutData.programs, items: newItems });
                }}
              />
              <TextField
                label="Deskripsi Item"
                value={item.description}
                onChange={(v) => {
                  const newItems = [...aboutData.programs.items];
                  newItems[idx].description = v;
                  updateData("programs", { ...aboutData.programs, items: newItems });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const newItems = aboutData.programs.items.filter((_: ProgramItem, i: number) => i !== idx);
                  updateData("programs", { ...aboutData.programs, items: newItems });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateData("programs", {
                ...aboutData.programs,
                items: [...aboutData.programs.items, { name: "", description: "" }],
              })
            }
            className="flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <Plus /> Tambah Item
          </button>
        </div>
      </AccordionSection>

      {/* Facilities */}
      <AccordionSection
        title="Fasilitas"
        isOpen={openSections.facilities}
        toggleOpen={() => toggleSection("facilities")}
      >
        <TextField
          label="Judul Fasilitas"
          value={aboutData.facilities.title}
          onChange={(v) => updateData("facilities", { ...aboutData.facilities, title: v })}
        />
        <TextAreaField
          label="Deskripsi Fasilitas"
          value={aboutData.facilities.description}
          onChange={(v) => updateData("facilities", { ...aboutData.facilities, description: v })}
        />
        <div className="space-y-4">
          {aboutData.facilities.items.map((item: FacilityItem, idx: number) => (
            <div key={idx} className="flex flex-col gap-2 border p-4 rounded-md">
              <TextField
                label="Nama Item"
                value={item.name}
                onChange={(v) => {
                  const newItems = [...aboutData.facilities.items];
                  newItems[idx].name = v;
                  updateData("facilities", { ...aboutData.facilities, items: newItems });
                }}
              />
              <TextField
                label="Deskripsi Item"
                value={item.description}
                onChange={(v) => {
                  const newItems = [...aboutData.facilities.items];
                  newItems[idx].description = v;
                  updateData("facilities", { ...aboutData.facilities, items: newItems });
                }}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                <div className="flex gap-2 flex-wrap">
                  {(item.images || []).map((img: string, i: number) => (
                    <div key={i} className="relative w-24 h-24">
                      <img
                        src={img}
                        className="w-full h-full object-cover rounded-md border"
                        alt={`facility-${idx}-${i}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...aboutData.facilities.items];
                          newItems[idx].images = newItems[idx].images.filter((_: string, j: number) => j !== i);
                          updateData("facilities", { ...aboutData.facilities, items: newItems });
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("file", file);

                      try {
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                          credentials: "include",
                        });
                        const data = await res.json();
                        if (!data.url) throw new Error("Gagal upload");

                        const newItems = [...aboutData.facilities.items];
                        newItems[idx].images = [...(newItems[idx].images || []), data.url];
                        updateData("facilities", { ...aboutData.facilities, items: newItems });
                        setSnackbar("Gambar berhasil diupload!");
                      } catch (err: any) {
                        console.error('Upload error:', err.message);
                        setSnackbar("Gagal upload gambar");
                      }
                    }}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItems = aboutData.facilities.items.filter((_: FacilityItem, i: number) => i !== idx);
                  updateData("facilities", { ...aboutData.facilities, items: newItems });
                }}
                className="text-red-600 hover:text-red-800 mt-2 flex items-center gap-1"
              >
                <Trash2 /> Hapus Item
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateData("facilities", {
                ...aboutData.facilities,
                items: [...aboutData.facilities.items, { name: "", description: "", images: [] }],
              })
            }
            className="flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <Plus /> Tambah Item
          </button>
        </div>
      </AccordionSection>

      {/* Collaborations */}
      <AccordionSection
        title="Kolaborasi / Mitra"
        isOpen={openSections.collaborations}
        toggleOpen={() => toggleSection("collaborations")}
      >
        <TextField
          label="Judul Kolaborasi(Mitra)"
          value={aboutData.collaborations.title}
          onChange={(v) => updateData("collaborations", { ...aboutData.collaborations, title: v })}
        />
        <TextAreaField
          label="Deskripsi Kolaborasi"
          value={aboutData.collaborations.description}
          onChange={(v) => updateData("collaborations", { ...aboutData.collaborations, description: v })}
        />
        <div className="space-y-2">
          {aboutData.collaborations.partners.map((item: PartnerItem, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <TextField
                label="Nama Partner"
                value={item.name}
                onChange={(v) => {
                  const newItems = [...aboutData.collaborations.partners];
                  newItems[idx].name = v;
                  updateData("collaborations", { ...aboutData.collaborations, partners: newItems });
                }}
              />
              <TextField
                label="Peran Partner"
                value={item.role}
                onChange={(v) => {
                  const newItems = [...aboutData.collaborations.partners];
                  newItems[idx].role = v;
                  updateData("collaborations", { ...aboutData.collaborations, partners: newItems });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const newItems = aboutData.collaborations.partners.filter((_: PartnerItem, i: number) => i !== idx);
                  updateData("collaborations", { ...aboutData.collaborations, partners: newItems });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateData("collaborations", {
                ...aboutData.collaborations,
                partners: [...aboutData.collaborations.partners, { name: "", role: "" }],
              })
            }
            className="flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <Plus /> Tambah Partner
          </button>
        </div>
      </AccordionSection>

      {/* Operational */}
      <AccordionSection
        title="Jam Operasional"
        isOpen={openSections.operational}
        toggleOpen={() => toggleSection("operational")}
      >
        <TextField
          label="Judul"
          value={aboutData.operational.title}
          onChange={(v) => updateData("operational", { ...aboutData.operational, title: v })}
        />
        <div className="space-y-2 mt-2">
          {Object.entries(aboutData.operational.hours).map(([day, time]: [string, string]) => (
            <div key={day} className="flex items-center gap-2">
              <span className="w-24 capitalize">{day}</span>
              <input
                type="text"
                value={time}
                onChange={(e) => {
                  const newHours = { ...aboutData.operational.hours, [day]: e.target.value };
                  updateData("operational", { ...aboutData.operational, hours: newHours });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
        </div>
      </AccordionSection>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {snackbar && <p className="text-green-600 mt-2">{snackbar}</p>}
    </div>
  );
};

export default AboutAdminPage;