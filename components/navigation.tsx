"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Beranda" },
    { href: "/tentang", label: "Tentang Kami" },
    { href: "/kegiatan", label: "Kegiatan" },
    { href: "/berita", label: "Berita" },
    { href: "/galeri", label: "Galeri" },
    { href: "/kontak", label: "Kontak Kami" },
  ];

  const handleToggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200"
            aria-label="Beranda RPTRA Kebon Melati"
          >
            <Image
              src="/logo.PNG" // Adjust path as needed
              alt="Logo RPTRA Kebon Melati"
              width={80}
              height={80}
              className="w-20 h-20 sm:w-20 sm:h-20 rounded-full"
            />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                RPTRA Kebon Melati
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Ruang Publik Terpadu Ramah Anak
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-green-600 font-semibold"
                    : ""
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMenu}
              className="text-gray-700 hover:text-green-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? "text-green-600 font-semibold bg-green-50"
                      : ""
                  }`}
                  onClick={handleToggleMenu}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}