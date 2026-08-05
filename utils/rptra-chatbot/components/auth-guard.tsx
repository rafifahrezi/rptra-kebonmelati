"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Mock authentication check
    const checkAuth = () => {
      const token = localStorage.getItem("admin-token")
      setIsAuthenticated(!!token)
    }

    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle>Memuat...</CardTitle>
            <CardDescription>Memeriksa status autentikasi</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle>Akses Ditolak</CardTitle>
              <CardDescription>Anda tidak memiliki izin untuk mengakses halaman ini</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
