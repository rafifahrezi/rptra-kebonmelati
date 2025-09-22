import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "RPTRA Kebon Melati - Ruang Publik Terpadu Ramah Anak",
  description:
    "RPTRA Kebon Melati adalah ruang publik terpadu ramah anak di Jakarta yang menyediakan berbagai fasilitas dan kegiatan untuk masyarakat.",
  generator: "v0.app",
  keywords: "RPTRA, Kebon Melati, Jakarta, ruang publik, ramah anak, komunitas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
