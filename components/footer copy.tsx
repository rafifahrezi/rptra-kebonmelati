"use client"

import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { getTranslation } from "@/lib/i18n"

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">R</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">RPTRA Kebon Melati</h3>
                <p className="text-sm text-muted-foreground">{getTranslation(language, "home.hero.badge")}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getTranslation(language, "footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{getTranslation(language, "footer.quickLinks")}</h4>
            <div className="space-y-2">
              <Link
                href="/tentang"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {getTranslation(language, "nav.about")}
              </Link>
              <Link
                href="/kegiatan"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {getTranslation(language, "nav.events")}
              </Link>
              <Link href="/berita" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {getTranslation(language, "nav.news")}
              </Link>
              <Link href="/galeri" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {getTranslation(language, "nav.gallery")}
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{getTranslation(language, "footer.contact")}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p>Jl. Kebon Melati No. 123</p>
                  <p>Jakarta Pusat, DKI Jakarta 10230</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">(021) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">info@rptrakebon melati.id</span>
              </div>
            </div>
          </div>

          {/* Operating Hours & Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{getTranslation(language, "footer.hours")}</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p>{getTranslation(language, "footer.weekdays")}</p>
                  <p>{getTranslation(language, "footer.weekends")}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h5 className="font-medium text-foreground mb-3">{getTranslation(language, "footer.followUs")}</h5>
              <div className="flex space-x-3">
                <Link
                  href="#"
                  className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Facebook className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Youtube className="w-4 h-4 text-primary" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">{getTranslation(language, "footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}
