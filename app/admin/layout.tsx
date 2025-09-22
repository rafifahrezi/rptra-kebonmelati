"use client"

import { useAuth } from "@/lib/useAuth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  // Don't protect login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Only redirect if not loading, not authenticated, and not on login page
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.push("/admin/login")
    }
  }, [loading, isAuthenticated, isLoginPage, router])

  // Show loading for all admin pages while checking auth
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="text-gray-600 text-lg mt-4">Memuat...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // For login page, always show content
  if (isLoginPage) {
    return <>{children}</>
  }

  // For other admin pages, only show if authenticated
  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}