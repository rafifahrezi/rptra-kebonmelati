"use client";

import React, { useState, useCallback } from "react";
import {
  Calendar, User, Building, MapPin, Phone, Users, Clock,
  Home, TreePine, Send, ArrowLeft, CheckCircle, AlertCircle,
  FileText, Loader2, MessageSquare, Database, X
} from "lucide-react";

// Type Definitions
interface RequestForm {
  tanggalPelaksanaan: string;
  namaPeminjam: string;
  namaInstansi: string;
  alamat: string;
  noTelp: string;
  jumlahPeserta: number;
  waktuPenggunaan: string;
  penggunaanRuangan: "ya" | "tidak" | "";
  tujuanPenggunaan: "indoor" | "outdoor" | "";
}

// Input Field Component
const InputField: React.FC<{
  label: string;
  icon: React.ComponentType<any>;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
}> = ({ label, icon: Icon, required = false, children, description }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </div>
    </label>
    {children}
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

// Snackbar Component
const Snackbar: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
}> = ({ message, type = 'success', onClose }) => {
  const getSnackbarStyles = () => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`border rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm ${getSnackbarStyles()}`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="font-medium text-sm">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  requestData: RequestForm;
}> = ({ isOpen, onClose, requestData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Permohonan Berhasil Dikirim!</h3>
        <p className="text-gray-600 mb-6">
          Permohonan penggunaan RPTRA atas nama <strong>{requestData.namaPeminjam}</strong> telah dikirim via WhatsApp dan tersimpan dalam sistem.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};

// Main Request Component
const Request: React.FC = () => {
  const [formData, setFormData] = useState<RequestForm>({
    tanggalPelaksanaan: "",
    namaPeminjam: "",
    namaInstansi: "",
    alamat: "",
    noTelp: "",
    jumlahPeserta: 0,
    waktuPenggunaan: "",
    penggunaanRuangan: "",
    tujuanPenggunaan: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form handlers
  const handleInputChange = useCallback(
      (field: keyof RequestForm, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      },
      []
    );

  // Handle form submission
  const generateWhatsAppMessage = useCallback((data: RequestForm) => {
      const penggunaanRuanganText = data.penggunaanRuangan === "ya" ? "Ya" : data.penggunaanRuangan === "tidak" ? "Tidak" : "";
      const tujuanText = data.tujuanPenggunaan === "indoor" ? "Indoor" : data.tujuanPenggunaan === "outdoor" ? "Outdoor" : "";
  
      const message = `
  *PERMOHONAN PENGGUNAAN RPTRA BONTI*
  
  📅 *Tanggal Pelaksanaan:* ${new Date(data.tanggalPelaksanaan).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
  
  👤 *Peminjam:* ${data.namaPeminjam}
  🏢 *Instansi:* ${data.namaInstansi}
  📍 *Alamat:* ${data.alamat}
  📞 *No. Telepon:* ${data.noTelp}
  👥 *Jumlah Peserta:* ${data.jumlahPeserta} orang
  ⏰ *Waktu Penggunaan:* ${data.waktuPenggunaan}
  🏠 *Penggunaan Ruangan:* ${penggunaanRuanganText}
  🎯 *Tujuan Penggunaan:* ${tujuanText}
  
  Mohon konfirmasi ketersediaan dan persetujuan penggunaan RPTRA.
  
  Terima kasih! 🙏
      `.trim();
  
      return encodeURIComponent(message);
    }, []);
  // Handle form submission
  const handleSubmit = useCallback(async () => {
      const requiredFields: (keyof RequestForm)[] = [
        "tanggalPelaksanaan",
        "namaPeminjam",
        "namaInstansi",
        "alamat",
        "noTelp",
        "jumlahPeserta",
        "waktuPenggunaan",
        "penggunaanRuangan",
        "tujuanPenggunaan",
      ];
  
      for (const field of requiredFields) {
        if (
          formData[field] === "" ||
          formData[field] === null ||
          formData[field] === undefined ||
          (typeof formData[field] === "number" && formData[field] <= 0)
        ) {
          setSnackbar({ message: `Field ${field} is required`, type: "warning" });
          return;
        }
      }
  
      setIsSubmitting(true);
  
      try {
        const res = await fetch("/api/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            penggunaanRuangan: formData.penggunaanRuangan === "ya",
          }),
        });
  
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal mengirim permohonan");
        }
  
        // Buka WhatsApp dengan pesan
        const whatsappNumber = "628561408444"; // Ganti dengan nomor WA RPTRA
        const whatsappMessage = generateWhatsAppMessage(formData);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
        window.open(whatsappURL, "_blank");
  
        setShowSuccess(true);
        // Hapus snackbar success (tidak tampil)
      } catch (error) {
        console.error("Error submitting request:", error);
        setSnackbar({ message: "Gagal mengirim permohonan. Silakan coba lagi.", type: "error" });
      } finally {
        setIsSubmitting(false);
        setTimeout(() => {
        window.location.href = '/';
      }, 6000);
      }
    }, [formData, generateWhatsAppMessage]);

  // Reset form after success
  const handleSuccessClose = useCallback(() => {
      setShowSuccess(false);
      setFormData({
        tanggalPelaksanaan: "",
        namaPeminjam: "",
        namaInstansi: "",
        alamat: "",
        noTelp: "",
        jumlahPeserta: 0,
        waktuPenggunaan: "",
        penggunaanRuangan: "",
        tujuanPenggunaan: "",
      });
    }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>RPTRA</span>
            <span>/</span>
            <span className="text-blue-600 font-medium">Permohonan Penggunaan</span>
          </nav>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </button>
                <div className="bg-white/10 p-3 rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Form Permohonan Penggunaan RPTRA Bonti</h1>
              <p className="text-blue-100">Lengkapi formulir di bawah untuk mengajukan permohonan penggunaan fasilitas RPTRA</p>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="space-y-8">
          {/* Personal Information */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              Informasi Peminjam
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Nama Peminjam" icon={User} required>
                <input
                  type="text"
                  value={formData.namaPeminjam}
                  onChange={(e) => handleInputChange('namaPeminjam', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap peminjam"
                  required
                />
              </InputField>
              <InputField label="Nama Instansi/Perusahaan" icon={Building} required>
                <input
                  type="text"
                  value={formData.namaInstansi}
                  onChange={(e) => handleInputChange('namaInstansi', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nama instansi atau perusahaan"
                  required
                />
              </InputField>
              <InputField label="Alamat Lengkap" icon={MapPin} required>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => handleInputChange('alamat', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Alamat lengkap instansi/perusahaan"
                  required
                />
              </InputField>
              <InputField label="Nomor Telepon/HP" icon={Phone} required>
                <input
                  type="tel"
                  value={formData.noTelp}
                  onChange={(e) => handleInputChange('noTelp', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="081234567890"
                  pattern="[0-9+\-\s]+"
                  required
                />
              </InputField>
            </div>
          </section>

          {/* Event Details */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              Detail Acara
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Tanggal Pelaksanaan" icon={Calendar} required>
                <input
                  type="date"
                  value={formData.tanggalPelaksanaan}
                  onChange={(e) => handleInputChange('tanggalPelaksanaan', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </InputField>
              <InputField label="Waktu Penggunaan" icon={Clock} required description="Format: 08.00-13.00">
                <input
                  type="text"
                  value={formData.waktuPenggunaan}
                  onChange={(e) => handleInputChange('waktuPenggunaan', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="08.00-13.00"
                  pattern="^([0-1]?[0-9]|2[0-3])\.([0-5][0-9])-([0-1]?[0-9]|2[0-3])\.([0-5][0-9])$"
                  required
                />
              </InputField>
              <InputField label="Jumlah Peserta" icon={Users} required>
                <input
                  type="number"
                  value={formData.jumlahPeserta || ''}
                  onChange={(e) => handleInputChange('jumlahPeserta', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Jumlah peserta yang akan hadir"
                  min="1"
                  max="200"
                  required
                />
              </InputField>
            </div>
          </section>

          {/* Facility Usage */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              Penggunaan Fasilitas
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Penggunaan Ruangan
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {["ya", "tidak"].map((val) => (
                    <label
                      key={val}
                      className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${
                        formData.penggunaanRuangan === val
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="penggunaanRuangan"
                        value={val}
                        checked={formData.penggunaanRuangan === val}
                        onChange={(e) => handleInputChange("penggunaanRuangan", e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            formData.penggunaanRuangan === val
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.penggunaanRuangan === val && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {val === "ya" ? "Ya, Menggunakan Ruangan" : "Tidak, Hanya Area Terbuka"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {val === "ya"
                              ? "Memerlukan ruangan dalam RPTRA"
                              : "Hanya menggunakan area luar"}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Tujuan Penggunaan
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${formData.tujuanPenggunaan === 'indoor' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="tujuanPenggunaan"
                      value="indoor"
                      checked={formData.tujuanPenggunaan === 'indoor'}
                      onChange={(e) => handleInputChange('tujuanPenggunaan', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${formData.tujuanPenggunaan === "indoor"
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                          }`}
                      >
                        {formData.tujuanPenggunaan === "indoor" && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Indoor</p>
                          <p className="text-sm text-gray-500">Kegiatan dalam ruangan</p>
                        </div>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${formData.tujuanPenggunaan === "outdoor"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="tujuanPenggunaan"
                      value="outdoor"
                      checked={formData.tujuanPenggunaan === "outdoor"}
                      onChange={(e) => handleInputChange("tujuanPenggunaan", e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${formData.tujuanPenggunaan === "outdoor"
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                          }`}
                      >
                        {formData.tujuanPenggunaan === "outdoor" && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <TreePine className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Outdoor</p>
                          <p className="text-sm text-gray-500">Kegiatan area terbuka</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Form Summary */}
          <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ringkasan Permohonan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Peminjam:</span> {formData.namaPeminjam || "-"}
                </p>
                <p>
                  <span className="font-medium">Instansi:</span> {formData.namaInstansi || "-"}
                </p>
                <p>
                  <span className="font-medium">Tanggal:</span>{" "}
                  {formData.tanggalPelaksanaan
                    ? new Date(formData.tanggalPelaksanaan).toLocaleDateString("id-ID")
                    : "-"}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Waktu:</span> {formData.waktuPenggunaan || "-"}
                </p>
                <p>
                  <span className="font-medium">Peserta:</span>{" "}
                  {formData.jumlahPeserta > 0 ? `${formData.jumlahPeserta} orang` : "-"}
                </p>
                <p>
                  <span className="font-medium">Ruangan:</span>{" "}
                  {formData.penggunaanRuangan ? "Ya" : "Tidak"}
                </p>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim Permohonan...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Permohonan
                  </>
                )}
              </button>
            </div>
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex gap-2 mt-1">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Permohonan akan dikirim ke:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• WhatsApp Admin RPTRA untuk konfirmasi cepat</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Success Modal */}
        <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} requestData={formData} />

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

export default Request;
