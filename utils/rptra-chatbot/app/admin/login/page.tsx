"use client"

import { useAuth } from "@/lib/useAuth"
import { LoginForm } from "@/components/admin/LoginForm"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { login, error, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    return await login(email, password)
  }

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // redirect setelah state sinkron
      router.replace("/admin")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin RPTRA BONTI
            </h1>
            <p className="text-gray-600">Masuk ke dashboard admin</p>
          </div>
          <LoginForm onLogin={handleLogin} error={error} />
        </div>
      </div>
    </div>
  )
}
