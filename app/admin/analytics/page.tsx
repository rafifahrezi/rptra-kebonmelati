"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Users, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { VisitDataFromAPI, VisitFormData } from "@/types/types";
import AdminLoading from "@/app/admin/loading";
import RequestList from "@/components/admin/RequestList";
import { formatDateOnly } from "@/components/admin/FormattedDate";
import VisitTable from "@/components/admin/VisitTable";    // Import VisitTable component
import Calender from "@/components/admin/Calender";        // Import Calendar component (Code 2)

type ModalMode = "create" | "edit";

const initialFormData: VisitFormData = {
  date: "",
  time: "",
  anak: "0",
  balita: "0",
  dewasa: "0",
  lansia: "0",
  remaja: "0",
};

const VISITOR_FIELDS = [
  { key: "balita", label: "Balita", description: "0-5 tahun" },
  { key: "anak", label: "Anak", description: "6-12 tahun" },
  { key: "remaja", label: "Remaja", description: "13-17 tahun" },
  { key: "dewasa", label: "Dewasa", description: "18-59 tahun" },
  { key: "lansia", label: "Lansia", description: "60+ tahun" },
] as const;

// (LoadingSpinner, VisitModal, DeleteModal, Snackbar same as before, omitted here for brevity)
const LoadingSpinner: React.FC = () => (
  <AdminLoading message="Memverifikasi akses admin..." fullScreen />
);

const VisitModal: React.FC<{
  show: boolean;
  mode: ModalMode;
  formData: VisitFormData;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
  show,
  mode,
  formData,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "create" ? "Tambah Data Kunjungan" : "Edit Data Kunjungan"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Tutup modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kunjungan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={onFormChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VISITOR_FIELDS.map(({ key, label, description }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                  <span className="text-xs text-gray-500 ml-1">({description})</span>
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key as keyof VisitFormData]}
                  onChange={onFormChange}
                  min="0"
                  step="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  {mode === "create" ? "Tambah Data" : "Update Data"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// DeleteModal (biarkan di sini juga)
const DeleteModal: React.FC<{
  show: boolean;
  visit: VisitDataFromAPI | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ show, visit, onConfirm, onCancel }) => {
  if (!show || !visit) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hapus Data Kunjungan
          </h3>
          <p className="text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus data kunjungan tanggal{" "}
            <span className="font-semibold text-red-600">
              {formatDateOnly(visit.date)}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Hapus Data
          </button>
        </div>
      </div>
    </div>
  );
};

// Snackbar Component (di dalam file, bisa juga dipisah)
const Snackbar: React.FC<{
  open: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ open, message, type, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed right-4 bottom-4 px-4 py-3 rounded shadow-lg text-white font-medium ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
      role="alert"
    >
      {message}
    </div>
  );
};  
export default function MainPage() {
  const [visits, setVisits] = useState<VisitDataFromAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal and form states (same as before)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedVisit, setSelectedVisit] = useState<VisitDataFromAPI | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<VisitDataFromAPI | null>(null);

  const [formData, setFormData] = useState<VisitFormData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      type: 'success' | 'error';
    }>({
      open: false,
      message: '',
      type: 'success',
    });

  // New state: view mode ('list' or 'calendar')
  const [view, setView] = useState<"list" | "calendar">("list");

 const openSnackbar = useCallback((message: string, type: 'success' | 'error') => {
     setSnackbar((prev) => ({
       ...prev,
       open: true,
       message,
       type,
     }));
   }, []);


  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch visits (same as before)
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics", {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${res.status}: Gagal mengambil data`);
      }

      const rawData: any[] = await res.json();

      const data: VisitDataFromAPI[] = Array.isArray(rawData) ? rawData.map(item => ({
        id: item._id,
        date: item.date,
        anak: item.anak,
        balita: item.balita,
        dewasa: item.dewasa,
        lansia: item.lansia,
        remaja: item.remaja,
      })) : [];

      setVisits(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui";
      setError(errorMessage);
      openSnackbar(errorMessage, 'error');
      console.error('Fetch visits error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Form change handler (same as before)
  const onFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name !== 'date' && name !== 'time') {
      const numValue = parseInt(value, 10);
      if (value !== '' && (isNaN(numValue) || numValue < 0)) {
        return; // ignore invalid number input
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError(null);
    }
  }, [formError]);

  // Modal handlers (same as before)
  const openCreateModal = useCallback(() => {
    setModalMode("create");
    setSelectedVisit(null);
    setFormData(initialFormData);
    setFormError(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((visit: VisitDataFromAPI) => {
    setModalMode("edit");
    setSelectedVisit(visit);
    setFormData({
      date: new Date(visit.date).toISOString().slice(0, 10),
      time: "",
      anak: String(visit.anak ?? 0),
      balita: String(visit.balita ?? 0),
      dewasa: String(visit.dewasa ?? 0),
      lansia: String(visit.lansia ?? 0),
      remaja: String(visit.remaja ?? 0),
    });
    setFormError(null);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedVisit(null);
    setFormError(null);
    setIsSubmitting(false);
    setFormData(initialFormData);
  }, []);

  // Submit form (same as before)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.date) {
      setFormError("Tanggal harus diisi");
      return;
    }

    const dateObj = new Date(formData.date);
    if (isNaN(dateObj.getTime())) {
      setFormError("Format tanggal tidak valid");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj > today) {
      setFormError("Tanggal tidak boleh lebih dari hari ini");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      date: dateObj.toISOString(),
      anak: parseInt(formData.anak, 10) || 0,
      balita: parseInt(formData.balita, 10) || 0,
      dewasa: parseInt(formData.dewasa, 10) || 0,
      lansia: parseInt(formData.lansia, 10) || 0,
      remaja: parseInt(formData.remaja, 10) || 0,
    };

    try {
      let url: string;
      let method: string;

      if (modalMode === "create") {
        url = "/api/analytics";
        method = "POST";
      } else if (modalMode === "edit") {
        if (!selectedVisit || !selectedVisit.id) {
          throw new Error("Data kunjungan tidak valid atau tidak ditemukan");
        }
        url = `/api/analytics/${selectedVisit.id}`;
        method = "PUT";
      } else {
        throw new Error("Invalid modal state");
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${res.status}: Gagal menyimpan data`);
      }

      openSnackbar(
        modalMode === "create"
          ? "Data kunjungan berhasil ditambahkan"
          : "Data kunjungan berhasil diperbarui",
        'success'
      );

      closeModal();
      await fetchVisits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data";
      setFormError(errorMessage);
      openSnackbar(errorMessage, 'error');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, modalMode, selectedVisit, closeModal, fetchVisits]);

  // Delete handlers (same as before)
  const openDeleteModal = useCallback((visit: VisitDataFromAPI) => {
    setVisitToDelete(visit);
    setShowDeleteModal(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setVisitToDelete(null);
    setShowDeleteModal(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!visitToDelete?.id) {
      openSnackbar("Data kunjungan tidak valid atau tidak ditemukan", 'error');
      return;
    }

    try {
      const res = await fetch(`/api/analytics/${visitToDelete.id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${res.status}: Gagal menghapus data`);
      }

      openSnackbar("Data kunjungan berhasil dihapus", 'success');
      cancelDelete();
      await fetchVisits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus data";
      openSnackbar(errorMessage, 'error');
      console.error('Delete error:', err);
    }
  }, [visitToDelete, cancelDelete, fetchVisits]);

  // Total stats (same as before)
  const stats = useMemo(() => {
    if (visits.length === 0) return { total: 0, thisMonth: 0, avgDaily: 0 };

    const sumVisit = (visit: VisitDataFromAPI) => {
      return Object.values(visit)
        .filter(value => typeof value === 'number')
        .reduce((sum, value) => sum + value, 0);
    };

    const total = visits.reduce((sum, visit) => sum + sumVisit(visit), 0);

    const thisMonth = visits.filter(visit => {
      const visitDate = new Date(visit.date);
      const now = new Date();
      return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
    }).length;

    const avgDaily = Math.round(total / visits.length);

    return { total, thisMonth, avgDaily };
  }, [visits]);

  // Handler for calendar date click: switch to list and filter by date
  const [filterDate, setFilterDate] = useState<string | null>(null);

  // State untuk selected date dari calendar
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Handler untuk mengatur selected date dari calendar
  const handleCalendarDateClick = useCallback((date: string) => {
    setSelectedDate(date);
    setView("list");
  }, []);

  // Filter visits by selected date if any
  const filteredVisits = useMemo(() => {
    if (!filterDate) return visits;
    return visits.filter(v => v.date === filterDate);
  }, [visits, filterDate]);

  // Clear date filter when switching to calendar view
  useEffect(() => {
    if (view === "calendar") {
      setFilterDate(null);
    }
  }, [view]); 

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
                <p className="text-gray-600 mt-1">Monitor dan kelola data kunjungan RPTRA</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setView(view === "list" ? "calendar" : "list")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                aria-label="Toggle view mode"
              >
                <CalendarIcon className="w-5 h-5" />
                {view === "list" ? "Tampilkan Kalender" : "Tampilkan Tabel"}
              </button>

              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Data
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        {view === "calendar" ? (
          <Calender 
    onDateClick={handleCalendarDateClick} 
  />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Data Kunjungan</h2>
              {filterDate && (
                <p className="text-gray-600 mt-1">
                  Menampilkan data kunjungan tanggal <strong>{formatDateOnly(filterDate)}</strong>
                  {" "}
                  <button
                    onClick={() => setFilterDate(null)}
                    className="ml-2 text-blue-600 underline hover:text-blue-800"
                    aria-label="Hapus filter tanggal"
                  >
                    (Hapus filter)
                  </button>
                </p>
              )}
              {!filterDate && <p className="text-gray-600 mt-1">Daftar semua data kunjungan yang tercatat</p>}
            </div>

            <div className="p-6">
              <VisitTable
                visits={filteredVisits}
                loading={loading}
                error={error}
                onRetry={fetchVisits}
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
              />
            </div>
            <RequestList 
              selectedDate={selectedDate} 
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <VisitModal
        show={showModal}
        mode={modalMode}
        formData={formData}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={onFormChange}
      />

      <DeleteModal
        show={showDeleteModal}
        visit={visitToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />
    </main>
  );
}
