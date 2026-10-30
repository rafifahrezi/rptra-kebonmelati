"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PegawaiModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Pegawai {
    _id: string;
    nama: string;
    jabatan: string;
    foto: string;
}

export function PegawaiModal({ isOpen, onClose }: PegawaiModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [entered, setEntered] = useState(false);
    // undefined = belum dimuat, [] = sudah dimuat tapi belum ada data
    const [items, setItems] = useState<Pegawai[] | undefined>(undefined);
    const [error, setError] = useState(false);

    // Muat sekali saat pertama dibuka; gagal akan dicoba lagi saat dibuka berikutnya
    useEffect(() => {
        if (!isOpen || items !== undefined) return;

        const controller = new AbortController();
        setError(false);

        fetch("/api/pegawai", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => setItems(json.items ?? [])) // sudah terurut dari API: urutan kecil di atas
            .catch((err) => {
                if (err.name !== "AbortError") setError(true);
            });

        return () => controller.abort();
    }, [isOpen, items]);

    useEffect(() => {
        if (!isOpen) {
            setEntered(false);
            return;
        }

        const panel = panelRef.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        panel?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !panel) return;

            const focusables = panel.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (e.shiftKey && (active === first || active === panel)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const raf = requestAnimationFrame(() => setEntered(true));

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const loading = items === undefined && !error;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${entered ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Konten Modal */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pegawai-title"
                aria-busy={loading}
                tabIndex={-1}
                className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 outline-none transition-all duration-200 ${entered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
            >
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Profil</p>
                        <h2 id="pegawai-title" className="text-2xl font-bold text-gray-900">
                            Pegawai
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className="text-gray-500 hover:text-green-600 hover:bg-green-50 p-2 rounded-md"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {loading && (
                    <ul
                        className="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-4 animate-pulse"
                        role="status"
                        aria-label="Memuat"
                    >
                        {[0, 1, 2].map((i) => (
                            <li key={i} className="flex flex-col p-4 border border-gray-100 rounded-xl">
                                <div className="w-full aspect-square mb-4 rounded-lg bg-gray-200" />
                                <div className="h-4 w-3/4 mb-2 bg-gray-200 rounded" />
                                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                            </li>
                        ))}
                    </ul>
                )}

                {error && (
                    <p role="alert" className="text-red-600">
                        Gagal memuat data. Tutup lalu buka kembali untuk mencoba lagi.
                    </p>
                )}

                {items?.length === 0 && <p className="text-gray-600">Belum ada data pegawai.</p>}

                {/* Mobile: tersusun vertikal penuh. Desktop: berjajar horizontal (turun baris bila banyak) */}
                {!!items?.length && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {items.map((pegawai) => (
                            <li
                                key={pegawai._id}
                                className="flex flex-col p-4 border border-gray-100 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {pegawai.foto ? (
                                    <Image
                                        src={`/api/files/${pegawai.foto}`}
                                        alt={`Foto ${pegawai.nama}`}
                                        width={400}
                                        height={400}
                                        unoptimized // stream GridFS, tidak perlu lewat optimizer Next
                                        className="w-full h-auto aspect-square mb-4 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-full aspect-square mb-4 rounded-lg bg-gray-100 text-gray-400"
                                        aria-hidden="true"
                                    >
                                        <User className="w-12 h-12" />
                                    </div>
                                )}

                                <p className="font-semibold text-gray-900 text-center">{pegawai.nama}</p>
                                <p className="text-sm text-gray-500 text-center leading-snug">{pegawai.jabatan}</p>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    );
}