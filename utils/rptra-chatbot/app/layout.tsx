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
import { ChatWidget } from "@/components/chatbot/ChatWidget";
export const metadata: Metadata = {
  title: "RPTRA Kebon Melati - Ruang Publik Terpadu Ramah Anak",
  description:
    "RPTRA Kebon Melati adalah ruang publik terpadu ramah anak di Jakarta yang menyediakan berbagai fasilitas dan kegiatan untuk masyarakat.",
  authors: [{ name: 'rptrabonti' }],
  creator: 'rptrabonti',
  keywords: "RPTRA, Kebon Melati, Jakarta, ruang publik, ramah anak, komunitas",
  alternates: {
    canonical: 'https://rptrabonti.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RPTRA Kebon Melati",
  alternateName: "rptrabonti",
  url: "https://rptrabonti.com",
  logo: "https://rptrabonti.com/logo-bonti.gif",
  sameAs: [
    "https://www.instagram.com/rptrabonti",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Jakarta",
    addressCountry: "ID",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/logo-bonti.gif" type="image/gif" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
          <ChatWidget />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
