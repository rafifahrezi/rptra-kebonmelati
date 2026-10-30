"use client"

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { GambaranUmumModal } from "@/components/profil/gambaran-umum-modal";
import { PegawaiModal } from "@/components/profil/pegawai-modal";
import { TugasFungsiModal } from "@/components/profil/tugas-fungsi-modal";


type ModalKey = "gambaran-umum" | "pegawai" | "tugas-fungsi";

type NavChild = {
  href: string;
  label: string;
  modal?: ModalKey;
};

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  children?: NavChild[];
};

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/", label: "Beranda" },
    {
      href: "/profil",
      label: "Profil",
      children: [
        { href: "/profil/gambaran-umum", label: "Gambaran Umum", modal: "gambaran-umum" },
        { href: "/profil/pegawai", label: "Pegawai", modal: "pegawai" },
        { href: "/profil/tugas-dan-fungsi", label: "Tugas dan Fungsi", modal: "tugas-fungsi" },
      ],
    },
    { href: "/tentang", label: "Tentang Kami" },
    { href: "/kegiatan", label: "Kegiatan" },
    { href: "/berita", label: "Berita" },
    { href: "/galeri", label: "Galeri" },
    {
      href: "https://drive.google.com/drive/folders/11N1OmoPL5NpF52m5c1R6L6V7jdkzAWez",
      label: "E-Perpus",
      external: true,
    },
    {
      href: "https://drive.google.com/drive/folders/1U9Qv_t0aKI1FILVxqtxg_HbvRuJoIPwV",
      label: "Administrasi",
      external: true,
    },
    { href: "/kontak", label: "Kontak Kami" },
  ];

  const handleToggleMenu = () => setIsOpen((prev) => !prev);

  const openModal = (key: ModalKey) => {
    setIsOpen(false); // tutup menu mobile jika sedang terbuka
    setActiveModal(key);
  };

  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50 transition-shadow duration-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo, Brand & Mobile Button */}
          <div className="flex justify-between items-center py-4">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200"
              aria-label="Beranda RPTRA BONTI"
            >
              <Image
                src="/logo.PNG"
                alt="Logo RPTRA BONTI"
                width={80}
                height={80}
                className="w-20 h-20 sm:w-20 sm:h-20 rounded-full"
              />
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  RPTRA BONTI
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Ruang Publik Terpadu Ramah Anak
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.href} className="relative group">
                    <button
                      type="button"
                      className={`flex items-center gap-1 text-gray-700 group-hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200 ${pathname.startsWith(item.href) ? "text-green-600 font-semibold" : ""
                        }`}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute left-0 top-full hidden group-hover:block group-focus-within:block min-w-48 bg-white border border-gray-100 shadow-lg rounded-md py-1">
                      {item.children.map((child) =>
                        child.modal ? (
                          <button
                            key={child.label}
                            type="button"
                            onClick={() => openModal(child.modal!)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                          >
                            {child.label}
                          </button>
                        ) : (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                          >
                            {child.label}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                ) : item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    aria-label={item.label}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${pathname === item.href ? "text-green-600 font-semibold" : ""
                      }`}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                    )}
                  </Link>
                )
              )}
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
                {navItems.map((item) => {
                  if (item.children) {
                    const isGroupOpen = openGroup === item.href;
                    return (
                      <div key={item.href} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setOpenGroup(isGroupOpen ? null : item.href)}
                          aria-expanded={isGroupOpen}
                          aria-controls={`mobile-${item.href}`}
                          className={`flex min-h-11 w-full items-center justify-between px-4 py-2.5 rounded-md text-sm font-semibold transition-colors duration-200 hover:bg-green-50 hover:text-green-600 ${pathname.startsWith(item.href) ? "text-green-600" : "text-gray-900"
                            }`}
                        >
                          {item.label}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${isGroupOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isGroupOpen && (
                          <div id={`mobile-${item.href}`} className="flex flex-col pl-4 mt-1 space-y-1">
                            {item.children.map((child) =>
                              child.modal ? (
                                <button
                                  key={child.label}
                                  type="button"
                                  onClick={() => openModal(child.modal!)}
                                  className="flex min-h-11 w-full items-center px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                  {child.label}
                                </button>
                              ) : (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={handleToggleMenu}
                                  className="flex min-h-11 items-center px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                  {child.label}
                                </Link>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-sm font-medium transition-colors duration-200"
                      aria-label={item.label}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-sm font-medium transition-colors duration-200 ${pathname === item.href ? "text-green-600 font-semibold bg-green-50" : ""
                        }`}
                      onClick={handleToggleMenu}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modal Profil */}
      <GambaranUmumModal isOpen={activeModal === "gambaran-umum"} onClose={closeModal} />
      <PegawaiModal isOpen={activeModal === "pegawai"} onClose={closeModal} />
      <TugasFungsiModal isOpen={activeModal === "tugas-fungsi"} onClose={closeModal} />
    </>
  );
}
