"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();
    router.push("/admin/login");
  }, [logout, router]);

  return <p className="text-center p-4">Logging out...</p>;
}