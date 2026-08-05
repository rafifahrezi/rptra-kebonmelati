"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash, Check, X, ArrowLeft, Search, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AdminLoading from "@/app/admin/loading";
import Link from "next/link";
import { useAuth } from "../../../lib/useAuth";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";

// ================= Types =================
interface Admin {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "superadmin";
  lastLogin: string | null;
  createdAt: string;
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function ManajemenAdmin() {
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading, checkAuth, logout } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "" | "admin" | "superadmin",
  });
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });
  const isSuperAdmin = user?.role === "superadmin";

  // Redirect if unauthorized
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isSuperAdmin)) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Hanya superadmin yang dapat mengakses halaman ini",
      });
      router.push("/admin?error=unauthorized");
    }
  }, [authLoading, isAuthenticated, isSuperAdmin, router, toast]);

  // Fetch admins with search and pagination
  const fetchAdmins = useCallback(
    debounce(async (searchQuery: string, page: number) => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("admin-token") || "";
        const response = await fetch(`/api/users?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!response.ok) {
          let errorMsg = "Gagal memuat data admin";
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch {
            // response body bukan json
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setAdmins(data.users);
        setPagination(data.pagination);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Gagal memuat data admin",
        });
        if (error.message.includes("Unauthorized")) {
          checkAuth();
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [toast, checkAuth, isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchAdmins(search, pagination.page);
    }
  }, [search, pagination.page, isAuthenticated, isSuperAdmin, fetchAdmins]);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle create/update admin
  const handleSave = async () => {
    if (!formData.username || !formData.email || !formData.role) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username, email, dan role wajib diisi",
      });
      return;
    }
    if (!currentAdmin && (!formData.password || formData.password !== formData.confirmPassword)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
      });
      return;
    }

    try {
      if (!isAuthenticated) throw new Error("Sesi tidak valid. Silakan login kembali.");

      const payload: any = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
      };
      if (!currentAdmin) {
        // create new admin, password required
        payload.password = formData.password;
      } else if (formData.password) {
        // update password if field filled
        payload.password = formData.password;
      }

      const url = currentAdmin ? `/api/users/${currentAdmin._id}` : "/api/users";
      const method = currentAdmin ? "PUT" : "POST";

      const token = localStorage.getItem("admin-token") || "";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = "Gagal menyimpan admin";
        try {
          const errData = await response.json();
          msg = errData.error || msg;
        } catch { }
        throw new Error(msg);
      }

      const data = await response.json();
      setAdmins((prev) => {
        if (currentAdmin) {
          return prev.map((admin) => (admin._id === currentAdmin._id ? data.user : admin));
        } else {
          return [...prev, data.user];
        }
      });
      toast({
        title: "Sukses",
        description: currentAdmin ? "Admin berhasil diperbarui" : "Admin berhasil ditambahkan",
      });
      setIsModalOpen(false);
      setCurrentAdmin(null);
      setFormData({ username: "", email: "", password: "", confirmPassword: "", role: "" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menyimpan data admin",
      });
      if (error.message.includes("Unauthorized")) {
        checkAuth();
      }
      console.error(error);
    }
  };

  // Handle delete admin
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;
    try {
      if (!isAuthenticated) throw new Error("Sesi tidak valid. Silakan login kembali.");

      const token = localStorage.getItem("admin-token") || "";
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        let errorMsg = "Gagal menghapus admin";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          // maybe non-json error response
        }
        throw new Error(errorMsg);
      }

      setAdmins((prev) => prev.filter((admin) => admin._id !== id));
      toast({
        title: "Sukses",
        description: "Admin berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menghapus data admin",
      });
      if (error.message.includes("Unauthorized")) {
        checkAuth();
      }
      console.error(error);
    }
  };

  if (authLoading || loading) {
    return <AdminLoading message="Memverifikasi akses admin..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Pengguna Admin</h1>
                <p className="text-gray-600">Kelola akun admin dan pengaturan akses sistem</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isSuperAdmin && (
                <Button
                  onClick={() => {
                    setCurrentAdmin(null);
                    setFormData({ username: "", email: "", password: "", confirmPassword: "", role: "" });
                    setIsModalOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Admin
                </Button>
              )}
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  logout();
                  router.push("/admin/login");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Add/Edit Admin Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentAdmin ? "Edit Admin" : "Tambah Admin"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              {!currentAdmin && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="col-span-3 p-2 border rounded focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Pilih Role</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="mr-2"
              >
                <X className="w-4 h-4 mr-2" /> Batal
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                <Check className="w-4 h-4 mr-2" /> Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Cari berdasarkan username, email, atau role..."
            />
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Admin ({pagination.total})
            </h3>
          </div>
          {admins.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Admin</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Mulai dengan menambahkan admin pertama untuk mengelola sistem RPTRA
                </p>
                {isSuperAdmin && (
                  <Button
                    onClick={() => {
                      setCurrentAdmin(null);
                      setFormData({ username: "", email: "", role: "admin", password: "", confirmPassword: "" });
                      setIsModalOpen(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Admin Pertama
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Daftar Admin</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Total {admins.length} admin terdaftar dalam sistem
                    </p>
                  </div>
                  {isSuperAdmin && (
                    <Button
                      onClick={() => {
                        setCurrentAdmin(null);
                        setFormData({ username: "", email: "", role: "admin", password: "", confirmPassword: "" });
                        setIsModalOpen(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Admin
                    </Button>
                  )}
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Informasi Admin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role & Permissions
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status Aktivitas
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Login Terakhir
                      </th>
                      {isSuperAdmin && (
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Kelola
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin, index) => (
                      <tr
                        key={admin._id}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                      >
                        {/* Admin Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white font-semibold text-sm">
                                  {admin.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {admin.username}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${admin.role === "superadmin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}>
                              {admin.role === "superadmin" ? "Super Admin" : "Administrator"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {admin.role === "superadmin" ? "Akses penuh sistem" : "Akses terbatas"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${admin.lastLogin ? "bg-green-500" : "bg-gray-400"
                              }`} />
                            <span className={`text-sm font-medium ${admin.lastLogin ? "text-green-700" : "text-gray-500"
                              }`}>
                              {admin.lastLogin ? "Aktif" : "Belum Login"}
                            </span>
                          </div>

                          {admin.lastLogin && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Online
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            {admin.lastLogin ? (
                              <>
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(admin.lastLogin).toLocaleDateString("id-ID", {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(admin.lastLogin).toLocaleTimeString("id-ID", {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: "Asia/Jakarta"
                                  })} WIB
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Belum pernah login
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        {isSuperAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                onClick={() => {
                                  setCurrentAdmin(admin);
                                  setFormData({
                                    username: admin.username,
                                    email: admin.email,
                                    role: admin.role,
                                    password: "",
                                    confirmPassword: ""
                                  });
                                  setIsModalOpen(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                title="Edit admin"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="sr-only">Edit {admin.username}</span>
                              </Button>

                              <Button
                                onClick={() => handleDelete(admin._id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                                title="Hapus admin"
                              >
                                <Trash className="w-4 h-4" />
                                <span className="sr-only">Hapus {admin.username}</span>
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Summary */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Menampilkan <span className="font-medium">{admins.length}</span> admin dari total <span className="font-medium">{admins.length}</span> admin
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Aktif: {admins.filter(admin => admin.lastLogin).length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Belum Login: {admins.filter(admin => !admin.lastLogin).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <Button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                disabled={pagination.page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Halaman {pagination.page} dari {pagination.pages}
              </span>
              <Button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, pagination.pages) }))}
                disabled={pagination.page === pagination.pages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
