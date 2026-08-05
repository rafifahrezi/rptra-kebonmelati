"use client";

import { useAuth } from "@/lib/useAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import AdminLoading from "@/app/admin/loading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Handle logout with error handling
  const handleLogout = async () => {
    try {
      setLogoutError(null);
      await logout();
      // Force full page reload to clear all client-side state
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError(
        error instanceof Error 
          ? error.message 
          : "Gagal logout. Silakan coba lagi."
      );
    }
  };

  // Redirect effect
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login"); 
    }
  }, [loading, user, router]);

  // Loading state
  if (loading || !user) {
    return <AdminLoading message="Memverifikasi akses admin..." fullScreen />;
  }

  // Logout error state
  if (logoutError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Logout Gagal
          </h2>
          <p className="text-red-600 text-sm mb-6">
            {logoutError}
          </p>
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Coba Logout Lagi
          </Button>
        </Card>
      </div>
    );
  }

  // Main dashboard view
  return (
    <AdminDashboard 
      user={user} 
      onLogout={handleLogout} 
    />
  );
}
