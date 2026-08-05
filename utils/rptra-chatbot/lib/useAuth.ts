"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"

export type User = {
  id?: string
  username?: string
  email?: string
  role?: 'superadmin' | 'admin'
  lastLogin?: string | null
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin-token")
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      // Memanggil API yang melakukan verifikasi token dan mengambil data admin dari DB
      const res = await fetch("/api/auth/verify", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP error ${res.status}`)
      }

      const data = await res.json()

      /**
       * data.user harus sesuai schema IAdmin (tanpa password)
       * Contoh:
       * {
       *   _id: string,
       *   username: string,
       *   email: string,
       *   role: 'superadmin' | 'admin',
       *   lastLogin: string | null,
       * }
       */

      if (!data.user) {
        throw new Error("User data not found")
      }

      setUser({
        id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        lastLogin: data.user.lastLogin,
      })
      setIsAuthenticated(true)
    } catch (err: any) {
      console.error("Auth check failed:", err.message)
      setError(err.message || "Sesi tidak valid. Silakan login kembali.")
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [pathname])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Memanggil API login yang memvalidasi user di collection Admins MongoDB
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login gagal")
        return false
      }

      localStorage.setItem("admin-token", data.token)

      setUser({
        id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        lastLogin: data.user.lastLogin,
      })

      setIsAuthenticated(true)
      return true
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan server")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("admin-token")
    setIsAuthenticated(false)
    setUser(null)
    setError(null)
  }

  return { isAuthenticated, user, loading, error, login, logout, checkAuth }
}
