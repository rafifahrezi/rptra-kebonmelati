"use client";

import { useAuth } from "@/lib/useAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard"; // pastikan path sesuai
import AdminLoading from "@/app/admin/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin"); // redirect ke login kalau belum login
    }
  }, [loading, user, router]);

  if (loading || !user) {
      return <AdminLoading message="Memverifikasi akses admin..." fullScreen />;
  }

  

  return <AdminDashboard user={user} onLogout={logout} />;
}
