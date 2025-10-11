"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/lib/useAuth";
import { LogOut, Home, Check, X, Users, Info, Calendar, Image, BarChart, Newspaper, Shield, Clock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface OperationalStatus {
  status: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByUser?: {
    username: string;
    email: string;
  };
}

interface AdminData {
  username: string;
  email: string;
  role: string;
  lastLogin?: string;
  firstName?: string;
  lastName?: string;
}

interface ManagementCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "purple" | "orange" | "green" | "gray";
  href: string;
  features: string[];
}

interface StatusToggleProps {
  status: boolean
  loading: boolean
  onToggle: () => void
}

export function StatusToggle({ status, loading, onToggle }: StatusToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${status
          ? "bg-red-600 text-white hover:bg-red-700 shadow-md"
          : "bg-green-600 text-white hover:bg-green-700 shadow-md"
        } ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg transform hover:scale-105"}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Memproses...
        </span>
      ) : status ? (
        <span className="flex items-center gap-2">
          <X className="w-4 h-4" /> Tutup RPTRA
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Check className="w-4 h-4" /> Buka RPTRA
        </span>
      )}
    </button>
  )
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch operational status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/operasional", {
          cache: "no-store",
          credentials: 'include'
        });
        if (!response.ok) throw new Error("Failed to fetch operational status");
        const data = await response.json();
        setOperationalStatus(data);
      } catch (err) {
        setError("Gagal memuat status operasional");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setAdminLoading(true);
        const response = await fetch("/api/admins", {
          cache: "no-store",
          credentials: 'include'
        });
        if (!response.ok) throw new Error("Failed to fetch admin data");
        const data = await response.json();
        setAdminData(data);
      } catch (err) {
        // console.error("Failed to fetch admin data:", err);
        // // Fallback to user data from props
        // setAdminData({
        //   username: user.username,
        //   email: user.email,
        //   role: user.role,
        //   lastLogin: user.lastLogin
        // });
      } finally {
        setAdminLoading(false);
      }
    };

    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const handleToggleStatus = async () => {
    if (!operationalStatus || updateLoading) return;

    setUpdateLoading(true);
    try {
      const response = await fetch("/api/operasional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: !operationalStatus.status,
          updatedBy: user.email,
          updatedByEmail: user.email
        }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to update status");
      const data = await response.json();
      setOperationalStatus(data);
    } catch (err) {
      setError("Gagal memperbarui status operasional");
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "Tidak ada data";
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Format tanggal tidak valid";
    }
  };

  const getDisplayName = (adminData: AdminData | null): string => {
    if (!adminData) return "Admin";
    if (adminData.firstName && adminData.lastName) {
      return `${adminData.firstName} ${adminData.lastName}`;
    }
    return adminData.username;
  };

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Administrator',
      'moderator': 'Moderator',
      'editor': 'Editor'
    };
    return roleMap[role] || role;
  };

  const managementCards: ManagementCard[] = [
    {
      title: "Manajemen Admin",
      description: "Kelola data admin dan izin akses sistem",
      icon: Users,
      color: "blue",
      href: "/admin/users",
      features: ["Tambah Admin Baru", "Edit Peran & Izin", "Hapus Admin", "Riwayat Login"],
    },
    {
      title: "Tentang Kami",
      description: "Kelola konten halaman tentang RPTRA",
      icon: Info,
      color: "purple",
      href: "/admin/about",
      features: ["Edit Hero Section", "Kelola Konten", "Upload Media"],
    },
    {
      title: "Kegiatan",
      description: "Manajemen kegiatan dan event RPTRA",
      icon: Calendar,
      color: "orange",
      href: "/admin/events",
      features: ["Tambah Kegiatan", "Jadwal Event", "Publikasi"],
    },
    {
      title: "Berita",
      description: "Kelola artikel berita dan pengumuman",
      icon: Newspaper,
      color: "purple",
      href: "/admin/news",
      features: ["Tulis Artikel", "Publikasi Berita", "Arsip"],
    },
    {
      title: "Galeri",
      description: "Upload dan organisir Foto Vidio kegiatan",
      icon: Image,
      color: "green",
      href: "/admin/gallery",
      features: ["Upload Foto", "Kelola Album", "Kelola Vidio Youtube"],
    },
    {
      title: "Analitik",
      description: "Statistik pengunjung dan Request",
      icon: BarChart,
      color: "gray",
      href: "/admin/analytics",
      features: ["Data Pengunjung", "Data Permohonan | Status", "Kotak Saran"],
    },
  ];

  // Filter managementCards berdasarkan role user
  const filteredManagementCards = managementCards.filter(card => {
    if (card.title === "Manajemen Admin") {
      // Hanya tampilkan jika role adalah super_admin
      return user.role === "superadmin";
    }
    return true; // tampilkan card lain tanpa filter
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6 mx-4 md:mx-8 lg:mx-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Admin RPTRA BONTI
            </h1>
            <p className="text-gray-600 text-base">
              Selamat datang kembali, <span className="font-medium">{getDisplayName(adminData)}</span>!
              Kelola sistem RPTRA dengan mudah dan efisien.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Home className="w-4 h-4" /> Ke Beranda
            </Link>
            <Button
              onClick={onLogout}
              variant="destructive"
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <main className="px-4 md:px-8 lg:px-12">
        {/* Combined Status & Admin Info Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Admin Status */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">Status Admin Aktif</h2>
                <p className="text-green-100 mb-2">
                  Masuk sebagai:{' '}
                  <span className="font-mono bg-white text-gray-500 bg-opacity-10 px-2 py-1 rounded text-sm">
                    {adminData?.email || user.email}
                  </span>
                </p>
                {adminLoading ? (
                  <div className="text-sm text-green-100">Memuat data admin...</div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-0 text-sm text-green-100">
                    <div className="flex items-center gap-2">
                      {/* <Clock className="w-4 h-4" />
                      <span>Login terakhir: {formatDate(adminData?.lastLogin || '')}</span> */}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Role: {getRoleDisplayName(adminData?.role || 'admin')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operational Status */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full">
                <Shield className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">Status Operasional RPTRA</h2>

                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-300 rounded-lg p-2 mb-3 text-red-100 text-sm">
                    {error}
                  </div>
                )}

                {loading ? (
                  <p className="text-green-100 text-sm">Memuat status operasional...</p>
                ) : (
                  <>
                    <div className="mb-3">
                      <span className="text-green-100 text-sm">Status saat ini: </span>
                      <span className={`font-semibold px-2 py-1 rounded text-sm ${operationalStatus?.status
                          ? "bg-green-400 text-green-900"
                          : "bg-red-400 text-red-900"
                        }`}>
                        {operationalStatus?.status ? "BUKA" : "TUTUP"}
                      </span>
                    </div>

                    {operationalStatus?.updatedAt && (
                      <div className="text-xs text-green-100 mb-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>Terakhir diperbarui: {formatDate(operationalStatus.updatedAt)}</span>
                        </div>
                        {operationalStatus.updatedByUser && (
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-3 h-3" />
                            <span>
                              Oleh: {operationalStatus.updatedByUser.username}
                              ({operationalStatus.updatedByUser.email})
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <StatusToggle
                      status={operationalStatus?.status || false}
                      onToggle={handleToggleStatus}
                      loading={updateLoading}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manajemen Sistem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManagementCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 group"
              >
                <div
                  className={`inline-flex p-3 rounded-lg ${getColorClass(
                    card.color
                  )} mb-4 group-hover:scale-105 transition-transform`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {card.description}
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  {card.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:bg-green-500 transition-colors"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm transition-colors">
                  Kelola{" "}
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function getColorClass(color: string) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 border-blue-200 group-hover:bg-blue-200",
    purple: "bg-purple-100 text-purple-600 border-purple-200 group-hover:bg-purple-200",
    orange: "bg-orange-100 text-orange-600 border-orange-200 group-hover:bg-orange-200",
    green: "bg-green-100 text-green-600 border-green-200 group-hover:bg-green-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200 group-hover:bg-gray-200",
  };
  return colorClasses[color as keyof typeof colorClasses] || "bg-gray-100 text-gray-600 border-gray-200";
}